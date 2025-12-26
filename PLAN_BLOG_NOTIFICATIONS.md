# Plan d'Implémentation: Notifications, Mentions @user et Newsletter

## 📋 Vue d'Ensemble

Implémentation de 3 fonctionnalités blog:
1. **Système de notifications temps réel** (PRIORITÉ HAUTE)
2. **Mentions @user dans commentaires** (PRIORITÉ HAUTE)
3. **Newsletter hebdomadaire** (PRIORITÉ BASSE)

## 🎯 Priorité d'Implémentation

1. **Phase 1**: Mentions @user (HAUTE) - Fondation pour les notifications
2. **Phase 2**: Système de notifications (HAUTE) - Dépend de Phase 1
3. **Phase 3**: Newsletter hebdomadaire (BASSE) - Indépendant

## 🏗️ Architecture Existante

### Backend (Déjà créé)
- ✅ `BlogNotification` entity avec tous les champs nécessaires
- ✅ `NotificationType` enum (NEW_POST, NEW_COMMENT, COMMENT_REPLY, POST_LIKE, COMMENT_LIKE, MENTION)
- ✅ `BlogNotificationRepository` avec queries optimisées (findUnreadByRecipientId, countUnread, etc.)

### À Créer
- ❌ `BlogNotificationService` - Logique métier notifications
- ❌ `BlogNotificationController` - Endpoints REST
- ❌ `UserMentionParser` - Utilitaire parsing mentions @user
- ❌ `BlogNewsletterService` - Service newsletter avec @Scheduled
- ❌ WebSocket config pour notifications temps réel

### Frontend (À créer)
- ❌ `notification-bell.component.ts` - Cloche notifications dans sidebar
- ❌ Autocomplete @user dans textarea commentaires
- ❌ Highlight mentions en bleu dans affichage commentaires
- ❌ WebSocket client pour notifications temps réel

---

## 🚀 PHASE 1: Mentions @user dans Commentaires (PRIORITÉ HAUTE)

### Objectifs
- Parser les mentions @username dans les commentaires
- Créer notifications MENTION automatiquement
- Autocomplete @user côté frontend
- Highlight mentions en bleu à l'affichage

### 1.1 Backend - Parsing Mentions

#### Créer `util/UserMentionParser.java`

**Responsabilités:**
- Extraire toutes les mentions @username d'un texte
- Valider que les users existent
- Retourner liste de User entities

**Pattern de mention:** `@[username]` où username = email (avant @)

**Code:**
```java
package com.catsbanque.mabanquetools.util;

import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserMentionParser {

    private final UserRepository userRepository;

    // Pattern: @[anything without spaces]
    // Examples: @bilal.djebbari, @john.doe, @admin
    private static final Pattern MENTION_PATTERN = Pattern.compile("@([a-zA-Z0-9._-]+)");

    /**
     * Extrait toutes les mentions @user valides d'un texte
     * @param content Contenu avec potentielles mentions
     * @return Liste d'utilisateurs mentionnés (dédupliquée)
     */
    public List<User> extractMentions(String content) {
        if (content == null || content.isEmpty()) {
            return List.of();
        }

        List<String> usernames = extractUsernames(content);

        if (usernames.isEmpty()) {
            return List.of();
        }

        // Chercher les users en base (par email prefix)
        List<User> mentionedUsers = new ArrayList<>();
        for (String username : usernames) {
            // Try exact email match first
            userRepository.findByEmail(username).ifPresent(mentionedUsers::add);

            // If not found, try with common domain patterns
            if (mentionedUsers.stream().noneMatch(u -> u.getEmail().startsWith(username))) {
                userRepository.findByEmail(username + "@ca-ts.fr")
                        .ifPresent(mentionedUsers::add);
            }
        }

        log.info("Extracted {} valid mentions from content", mentionedUsers.size());
        return mentionedUsers;
    }

    /**
     * Extrait les usernames bruts des mentions (sans validation)
     */
    public List<String> extractUsernames(String content) {
        List<String> usernames = new ArrayList<>();
        Matcher matcher = MENTION_PATTERN.matcher(content);

        while (matcher.find()) {
            String username = matcher.group(1); // Groupe 1 = sans le @
            if (!usernames.contains(username)) {
                usernames.add(username);
            }
        }

        return usernames;
    }

    /**
     * Remplace les mentions par des liens HTML (pour affichage frontend)
     * @param content Contenu avec mentions
     * @return HTML avec mentions en <span class="mention">
     */
    public String highlightMentions(String content) {
        if (content == null || content.isEmpty()) {
            return content;
        }

        return MENTION_PATTERN.matcher(content).replaceAll(
            "<span class=\"mention\">@$1</span>"
        );
    }
}
```

#### Modifier `BlogCommentService.java` - Intégrer parsing mentions

**Ajouter dans createComment():**

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class BlogCommentService {

    private final BlogCommentRepository blogCommentRepository;
    private final BlogPostRepository blogPostRepository;
    private final UserRepository userRepository;
    private final UserMentionParser mentionParser; // NOUVEAU
    private final BlogNotificationService notificationService; // NOUVEAU

    public BlogCommentDto createComment(CreateBlogCommentRequest request, String userId) {
        // Validation post exists
        BlogPost post = blogPostRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Article non trouvé"));

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Validation parent comment si reply
        BlogComment parentComment = null;
        if (request.getParentId() != null) {
            parentComment = blogCommentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Commentaire parent non trouvé"));
        }

        // Créer commentaire
        BlogComment comment = BlogComment.builder()
                .post(post)
                .author(author)
                .content(request.getContent())
                .parentComment(parentComment)
                .build();

        comment = blogCommentRepository.save(comment);
        log.info("Comment créé: {} sur post {} par {}", comment.getId(), post.getId(), author.getEmail());

        // ===== NOUVEAU: Parser mentions et créer notifications =====
        List<User> mentionedUsers = mentionParser.extractMentions(request.getContent());

        for (User mentionedUser : mentionedUsers) {
            // Ne pas notifier si l'auteur se mentionne lui-même
            if (!mentionedUser.getId().equals(userId)) {
                notificationService.createMentionNotification(
                    mentionedUser,
                    author,
                    post.getId(),
                    comment.getId(),
                    "Vous a mentionné dans un commentaire"
                );
            }
        }
        // ============================================================

        // Notification NEW_COMMENT pour l'auteur du post (si différent)
        if (!post.getAuthor().getId().equals(userId)) {
            notificationService.createCommentNotification(
                post.getAuthor(),
                author,
                post.getId(),
                comment.getId()
            );
        }

        // Notification COMMENT_REPLY si c'est une réponse (si différent de l'auteur du commentaire parent)
        if (parentComment != null && !parentComment.getAuthor().getId().equals(userId)) {
            notificationService.createReplyNotification(
                parentComment.getAuthor(),
                author,
                post.getId(),
                comment.getId()
            );
        }

        return toDto(comment);
    }

    // ... reste du code
}
```

### 1.2 Backend - Service Notifications

#### Créer `BlogNotificationService.java`

```java
package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.BlogNotificationDto;
import com.catsbanque.mabanquetools.entity.BlogNotification;
import com.catsbanque.mabanquetools.entity.NotificationType;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.repository.BlogNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogNotificationService {

    private final BlogNotificationRepository blogNotificationRepository;

    /**
     * Récupérer toutes les notifications d'un utilisateur
     */
    public List<BlogNotificationDto> getUserNotifications(String userId) {
        List<BlogNotification> notifications = blogNotificationRepository.findByRecipientId(userId);
        return notifications.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer les notifications non lues
     */
    public List<BlogNotificationDto> getUnreadNotifications(String userId) {
        List<BlogNotification> notifications = blogNotificationRepository.findUnreadByRecipientId(userId);
        return notifications.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Compter notifications non lues
     */
    public long getUnreadCount(String userId) {
        return blogNotificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    /**
     * Marquer une notification comme lue
     */
    @Transactional
    public void markAsRead(String notificationId, String userId) {
        BlogNotification notification = blogNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));

        // Vérifier ownership
        if (!notification.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("Accès refusé");
        }

        notification.setIsRead(true);
        blogNotificationRepository.save(notification);
        log.info("Notification {} marquée comme lue par {}", notificationId, userId);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    @Transactional
    public void markAllAsRead(String userId) {
        List<BlogNotification> unreadNotifications = blogNotificationRepository.findUnreadByRecipientId(userId);

        for (BlogNotification notification : unreadNotifications) {
            notification.setIsRead(true);
        }

        blogNotificationRepository.saveAll(unreadNotifications);
        log.info("Toutes les notifications ({}) marquées comme lues pour {}", unreadNotifications.size(), userId);
    }

    /**
     * Créer notification MENTION
     */
    @Transactional
    public void createMentionNotification(User recipient, User triggeredBy, String postId, String commentId, String customMessage) {
        BlogNotification notification = BlogNotification.builder()
                .type(NotificationType.MENTION)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId(postId)
                .relatedCommentId(commentId)
                .message(customMessage != null ? customMessage : "Vous a mentionné")
                .isRead(false)
                .build();

        blogNotificationRepository.save(notification);
        log.info("Notification MENTION créée pour {} par {}", recipient.getEmail(), triggeredBy.getEmail());
    }

    /**
     * Créer notification NEW_COMMENT
     */
    @Transactional
    public void createCommentNotification(User recipient, User triggeredBy, String postId, String commentId) {
        BlogNotification notification = BlogNotification.builder()
                .type(NotificationType.NEW_COMMENT)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId(postId)
                .relatedCommentId(commentId)
                .message("A commenté votre article")
                .isRead(false)
                .build();

        blogNotificationRepository.save(notification);
        log.info("Notification NEW_COMMENT créée pour {} par {}", recipient.getEmail(), triggeredBy.getEmail());
    }

    /**
     * Créer notification COMMENT_REPLY
     */
    @Transactional
    public void createReplyNotification(User recipient, User triggeredBy, String postId, String commentId) {
        BlogNotification notification = BlogNotification.builder()
                .type(NotificationType.COMMENT_REPLY)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId(postId)
                .relatedCommentId(commentId)
                .message("A répondu à votre commentaire")
                .isRead(false)
                .build();

        blogNotificationRepository.save(notification);
        log.info("Notification COMMENT_REPLY créée pour {} par {}", recipient.getEmail(), triggeredBy.getEmail());
    }

    /**
     * Créer notification POST_LIKE
     */
    @Transactional
    public void createPostLikeNotification(User recipient, User triggeredBy, String postId) {
        BlogNotification notification = BlogNotification.builder()
                .type(NotificationType.POST_LIKE)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId(postId)
                .message("A aimé votre article")
                .isRead(false)
                .build();

        blogNotificationRepository.save(notification);
        log.info("Notification POST_LIKE créée pour {} par {}", recipient.getEmail(), triggeredBy.getEmail());
    }

    /**
     * Créer notification NEW_POST (pour la newsletter ou abonnés)
     */
    @Transactional
    public void createNewPostNotification(User recipient, User author, String postId) {
        BlogNotification notification = BlogNotification.builder()
                .type(NotificationType.NEW_POST)
                .recipient(recipient)
                .triggeredBy(author)
                .relatedPostId(postId)
                .message("A publié un nouvel article")
                .isRead(false)
                .build();

        blogNotificationRepository.save(notification);
    }

    // === DTO Mapping ===

    private BlogNotificationDto toDto(BlogNotification notification) {
        return BlogNotificationDto.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .recipientId(notification.getRecipient().getId())
                .triggeredById(notification.getTriggeredBy().getId())
                .triggeredByName(notification.getTriggeredBy().getFirstName() + " " + notification.getTriggeredBy().getLastName())
                .relatedPostId(notification.getRelatedPostId())
                .relatedCommentId(notification.getRelatedCommentId())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
```

#### Créer `dto/BlogNotificationDto.java`

```java
package com.catsbanque.mabanquetools.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogNotificationDto {
    private String id;
    private String type; // NotificationType enum name
    private String recipientId;
    private String triggeredById;
    private String triggeredByName; // Prénom + Nom
    private String relatedPostId;
    private String relatedCommentId;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
```

### 1.3 Backend - Controller Notifications

#### Créer `BlogNotificationController.java`

```java
package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.BlogNotificationDto;
import com.catsbanque.mabanquetools.service.BlogNotificationService;
import com.catsbanque.mabanquetools.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/blog/notifications")
@RequiredArgsConstructor
@Slf4j
public class BlogNotificationController {

    private final BlogNotificationService blogNotificationService;
    private final JwtUtil jwtUtil;

    /**
     * GET /blog/notifications - Toutes les notifications
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<List<BlogNotificationDto>> getUserNotifications(HttpServletRequest request) {
        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        List<BlogNotificationDto> notifications = blogNotificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * GET /blog/notifications/unread - Notifications non lues uniquement
     */
    @GetMapping("/unread")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<List<BlogNotificationDto>> getUnreadNotifications(HttpServletRequest request) {
        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        List<BlogNotificationDto> notifications = blogNotificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * GET /blog/notifications/unread-count - Nombre de notifications non lues
     */
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(HttpServletRequest request) {
        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        long count = blogNotificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * PATCH /blog/notifications/:id/mark-read - Marquer une notification comme lue
     */
    @PatchMapping("/{id}/mark-read")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<Void> markAsRead(@PathVariable String id, HttpServletRequest request) {
        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        blogNotificationService.markAsRead(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /blog/notifications/mark-all-read - Marquer toutes comme lues
     */
    @PatchMapping("/mark-all-read")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<Void> markAllAsRead(HttpServletRequest request) {
        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        blogNotificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
```

### 1.4 Backend - Tests JUnit

#### Créer `BlogNotificationServiceTest.java`

```java
package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.BlogNotificationDto;
import com.catsbanque.mabanquetools.entity.BlogNotification;
import com.catsbanque.mabanquetools.entity.NotificationType;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.repository.BlogNotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlogNotificationServiceTest {

    @Mock
    private BlogNotificationRepository blogNotificationRepository;

    @InjectMocks
    private BlogNotificationService blogNotificationService;

    private User recipient;
    private User triggeredBy;
    private BlogNotification notification;

    @BeforeEach
    void setUp() {
        recipient = User.builder()
                .id("user1")
                .email("recipient@ca-ts.fr")
                .firstName("John")
                .lastName("Doe")
                .build();

        triggeredBy = User.builder()
                .id("user2")
                .email("author@ca-ts.fr")
                .firstName("Jane")
                .lastName("Smith")
                .build();

        notification = BlogNotification.builder()
                .id("notif1")
                .type(NotificationType.MENTION)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId("post1")
                .relatedCommentId("comment1")
                .message("Vous a mentionné")
                .isRead(false)
                .build();
    }

    @Test
    void getUserNotifications_shouldReturnAllNotifications() {
        when(blogNotificationRepository.findByRecipientId("user1"))
                .thenReturn(Arrays.asList(notification));

        List<BlogNotificationDto> result = blogNotificationService.getUserNotifications("user1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo("MENTION");
        assertThat(result.get(0).getMessage()).isEqualTo("Vous a mentionné");
        verify(blogNotificationRepository).findByRecipientId("user1");
    }

    @Test
    void getUnreadCount_shouldReturnCorrectCount() {
        when(blogNotificationRepository.countByRecipientIdAndIsReadFalse("user1"))
                .thenReturn(3L);

        long count = blogNotificationService.getUnreadCount("user1");

        assertThat(count).isEqualTo(3L);
    }

    @Test
    void markAsRead_shouldUpdateNotification() {
        when(blogNotificationRepository.findById("notif1"))
                .thenReturn(Optional.of(notification));
        when(blogNotificationRepository.save(any(BlogNotification.class)))
                .thenReturn(notification);

        blogNotificationService.markAsRead("notif1", "user1");

        assertThat(notification.getIsRead()).isTrue();
        verify(blogNotificationRepository).save(notification);
    }

    @Test
    void markAsRead_withWrongUser_shouldThrowException() {
        when(blogNotificationRepository.findById("notif1"))
                .thenReturn(Optional.of(notification));

        assertThatThrownBy(() -> blogNotificationService.markAsRead("notif1", "wrongUser"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Accès refusé");
    }

    @Test
    void createMentionNotification_shouldSaveNotification() {
        when(blogNotificationRepository.save(any(BlogNotification.class)))
                .thenReturn(notification);

        blogNotificationService.createMentionNotification(
                recipient, triggeredBy, "post1", "comment1", "Custom message"
        );

        verify(blogNotificationRepository).save(any(BlogNotification.class));
    }
}
```

#### Créer `UserMentionParserTest.java`

```java
package com.catsbanque.mabanquetools.util;

import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserMentionParserTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserMentionParser userMentionParser;

    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        user1 = User.builder()
                .id("user1")
                .email("bilal.djebbari@ca-ts.fr")
                .firstName("Bilal")
                .lastName("Djebbari")
                .build();

        user2 = User.builder()
                .id("user2")
                .email("john.doe@ca-ts.fr")
                .firstName("John")
                .lastName("Doe")
                .build();
    }

    @Test
    void extractUsernames_shouldFindSingleMention() {
        String content = "Hello @bilal.djebbari, comment ça va ?";

        List<String> usernames = userMentionParser.extractUsernames(content);

        assertThat(usernames).hasSize(1);
        assertThat(usernames).contains("bilal.djebbari");
    }

    @Test
    void extractUsernames_shouldFindMultipleMentions() {
        String content = "CC @bilal.djebbari et @john.doe pour info";

        List<String> usernames = userMentionParser.extractUsernames(content);

        assertThat(usernames).hasSize(2);
        assertThat(usernames).containsExactlyInAnyOrder("bilal.djebbari", "john.doe");
    }

    @Test
    void extractUsernames_shouldDeduplicateMentions() {
        String content = "@bilal.djebbari merci @bilal.djebbari pour votre aide";

        List<String> usernames = userMentionParser.extractUsernames(content);

        assertThat(usernames).hasSize(1);
        assertThat(usernames).contains("bilal.djebbari");
    }

    @Test
    void extractMentions_shouldReturnValidUsers() {
        String content = "Hello @bilal.djebbari et @john.doe";

        when(userRepository.findByEmail("bilal.djebbari@ca-ts.fr"))
                .thenReturn(Optional.of(user1));
        when(userRepository.findByEmail("john.doe@ca-ts.fr"))
                .thenReturn(Optional.of(user2));

        List<User> users = userMentionParser.extractMentions(content);

        assertThat(users).hasSize(2);
        assertThat(users).extracting("email")
                .containsExactlyInAnyOrder("bilal.djebbari@ca-ts.fr", "john.doe@ca-ts.fr");
    }

    @Test
    void highlightMentions_shouldWrapInSpan() {
        String content = "Hello @bilal.djebbari";

        String highlighted = userMentionParser.highlightMentions(content);

        assertThat(highlighted).isEqualTo("Hello <span class=\"mention\">@bilal.djebbari</span>");
    }
}
```

---

## 🚀 PHASE 2: Frontend - Mentions @user et Notifications

### 2.1 Service Notifications

#### Créer `services/blog-notification.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';

export interface BlogNotification {
  id: string;
  type: string; // NEW_POST, NEW_COMMENT, COMMENT_REPLY, POST_LIKE, COMMENT_LIKE, MENTION
  recipientId: string;
  triggeredById: string;
  triggeredByName: string;
  relatedPostId?: string;
  relatedCommentId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class BlogNotificationService {
  private apiUrl = '/api/blog/notifications';

  private notificationsSubject = new BehaviorSubject<BlogNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  async loadNotifications(): Promise<void> {
    try {
      const notifications = await firstValueFrom(
        this.http.get<BlogNotification[]>(this.apiUrl)
      );
      this.notificationsSubject.next(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  async loadUnreadCount(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`)
      );
      this.unreadCountSubject.next(response.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.apiUrl}/${notificationId}/mark-read`, {})
    );
    await this.loadNotifications();
    await this.loadUnreadCount();
  }

  async markAllAsRead(): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.apiUrl}/mark-all-read`, {})
    );
    await this.loadNotifications();
    await this.loadUnreadCount();
  }
}
```

### 2.2 Composant Cloche Notifications

#### Créer `components/blog/notification-bell.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BlogNotificationService, BlogNotification } from '../../services/blog-notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-bell">
      <button
        class="bell-button"
        (click)="toggleDropdown()"
        [class.has-unread]="(unreadCount$ | async)! > 0">
        <span class="material-icons">notifications</span>
        <span *ngIf="(unreadCount$ | async)! > 0" class="badge">
          {{ (unreadCount$ | async)! > 99 ? '99+' : (unreadCount$ | async) }}
        </span>
      </button>

      <!-- Dropdown -->
      <div *ngIf="showDropdown" class="notifications-dropdown">
        <!-- Header -->
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <button
            *ngIf="(unreadCount$ | async)! > 0"
            (click)="markAllAsRead()"
            class="mark-all-read">
            Tout marquer comme lu
          </button>
        </div>

        <!-- List -->
        <div class="notifications-list">
          <div
            *ngFor="let notification of notifications$ | async"
            class="notification-item"
            [class.unread]="!notification.isRead"
            (click)="handleNotificationClick(notification)">

            <div class="notification-icon">
              <span class="material-icons">{{ getIcon(notification.type) }}</span>
            </div>

            <div class="notification-content">
              <p class="notification-message">
                <strong>{{ notification.triggeredByName }}</strong>
                {{ notification.message }}
              </p>
              <p class="notification-time">{{ formatTime(notification.createdAt) }}</p>
            </div>

            <button
              *ngIf="!notification.isRead"
              (click)="markAsRead(notification.id, $event)"
              class="mark-read-btn">
              <span class="material-icons">check</span>
            </button>
          </div>

          <div *ngIf="(notifications$ | async)?.length === 0" class="empty-state">
            <span class="material-icons">notifications_none</span>
            <p>Aucune notification</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      *ngIf="showDropdown"
      class="backdrop"
      (click)="closeDropdown()">
    </div>
  `,
  styles: [`
    .notification-bell {
      position: relative;
    }

    .bell-button {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: var(--text-color);
      transition: color 0.2s;
    }

    .bell-button:hover {
      color: var(--primary-color);
    }

    .bell-button.has-unread .material-icons {
      color: var(--primary-color);
      animation: ring 2s ease-in-out infinite;
    }

    @keyframes ring {
      0%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(-10deg); }
      20%, 40% { transform: rotate(10deg); }
    }

    .badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 4px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .notifications-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 360px;
      max-height: 500px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }

    :host-context(.dark) .notifications-dropdown {
      background: var(--gray-800);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .dropdown-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .mark-all-read {
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 12px;
      cursor: pointer;
      padding: 4px 8px;
    }

    .notifications-list {
      overflow-y: auto;
      max-height: 400px;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      cursor: pointer;
      transition: background 0.2s;
    }

    .notification-item:hover {
      background: var(--gray-50);
    }

    :host-context(.dark) .notification-item:hover {
      background: var(--gray-700);
    }

    .notification-item.unread {
      background: #eff6ff;
    }

    :host-context(.dark) .notification-item.unread {
      background: rgba(59, 130, 246, 0.1);
    }

    .notification-icon .material-icons {
      color: var(--primary-color);
      font-size: 20px;
    }

    .notification-content {
      flex: 1;
    }

    .notification-message {
      margin: 0 0 4px;
      font-size: 14px;
      color: var(--text-color);
    }

    .notification-time {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .mark-read-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--text-secondary);
    }

    .mark-read-btn:hover {
      color: var(--primary-color);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      color: var(--text-secondary);
    }

    .empty-state .material-icons {
      font-size: 48px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 999;
      background: transparent;
    }
  `]
})
export class NotificationBellComponent implements OnInit {
  showDropdown = false;
  notifications$ = this.notificationService.notifications$;
  unreadCount$ = this.notificationService.unreadCount$;

  constructor(
    private notificationService: BlogNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Auto-refresh every 30s
    setInterval(() => {
      this.notificationService.loadNotifications();
      this.notificationService.loadUnreadCount();
    }, 30000);
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  async markAsRead(notificationId: string, event: Event): Promise<void> {
    event.stopPropagation();
    await this.notificationService.markAsRead(notificationId);
  }

  async markAllAsRead(): Promise<void> {
    await this.notificationService.markAllAsRead();
  }

  handleNotificationClick(notification: BlogNotification): void {
    // Marquer comme lue
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id);
    }

    // Rediriger vers le post ou commentaire
    if (notification.relatedPostId) {
      this.router.navigate(['/blog', notification.relatedPostId]);
      this.closeDropdown();
    }
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      NEW_POST: 'article',
      NEW_COMMENT: 'comment',
      COMMENT_REPLY: 'reply',
      POST_LIKE: 'favorite',
      COMMENT_LIKE: 'thumb_up',
      MENTION: 'alternate_email'
    };
    return icons[type] || 'notifications';
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
```

### 2.3 Autocomplete Mentions @user

#### Modifier `blog-post-view.component.ts` (zone commentaires)

**Template textarea avec autocomplete:**

```html
<div class="comment-form">
  <textarea
    [(ngModel)]="newCommentContent"
    (input)="onCommentInput($event)"
    (keydown)="onCommentKeydown($event)"
    placeholder="Écrivez un commentaire... (utilisez @ pour mentionner)"
    rows="3">
  </textarea>

  <!-- Autocomplete dropdown -->
  <div *ngIf="showUserAutocomplete" class="autocomplete-dropdown">
    <div
      *ngFor="let user of filteredUsers; let i = index"
      class="autocomplete-item"
      [class.selected]="i === selectedUserIndex"
      (mouseenter)="selectedUserIndex = i"
      (click)="insertMention(user)">
      <span class="user-avatar">{{ user.firstName[0] }}{{ user.lastName[0] }}</span>
      <div class="user-info">
        <p class="user-name">{{ user.firstName }} {{ user.lastName }}</p>
        <p class="user-email">{{ user.email }}</p>
      </div>
    </div>
  </div>

  <button (click)="submitComment()">Publier</button>
</div>
```

**Component logic:**

```typescript
export class BlogPostViewComponent {
  newCommentContent = '';
  showUserAutocomplete = false;
  filteredUsers: BlogAuthor[] = [];
  selectedUserIndex = 0;
  mentionStartIndex = -1;
  allUsers: BlogAuthor[] = []; // Charger depuis un endpoint /api/users

  onCommentInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = this.newCommentContent.substring(0, cursorPos);

    // Chercher le dernier @ avant le curseur
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

      // Vérifier qu'il n'y a pas d'espace après @
      if (!textAfterAt.includes(' ')) {
        this.mentionStartIndex = lastAtIndex;
        const query = textAfterAt.toLowerCase();

        // Filtrer utilisateurs
        this.filteredUsers = this.allUsers.filter(user => {
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
          const email = user.email.toLowerCase();
          return fullName.includes(query) || email.includes(query);
        });

        this.showUserAutocomplete = this.filteredUsers.length > 0;
        this.selectedUserIndex = 0;
        return;
      }
    }

    this.showUserAutocomplete = false;
  }

  onCommentKeydown(event: KeyboardEvent): void {
    if (!this.showUserAutocomplete) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedUserIndex = Math.min(
        this.selectedUserIndex + 1,
        this.filteredUsers.length - 1
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedUserIndex = Math.max(this.selectedUserIndex - 1, 0);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      this.insertMention(this.filteredUsers[this.selectedUserIndex]);
    } else if (event.key === 'Escape') {
      this.showUserAutocomplete = false;
    }
  }

  insertMention(user: BlogAuthor): void {
    const mention = `@${user.email.split('@')[0]}`;

    const before = this.newCommentContent.substring(0, this.mentionStartIndex);
    const after = this.newCommentContent.substring(this.mentionStartIndex);
    const afterQuery = after.substring(after.indexOf(' ') !== -1 ? after.indexOf(' ') : after.length);

    this.newCommentContent = before + mention + ' ' + afterQuery;
    this.showUserAutocomplete = false;
  }
}
```

**Styles autocomplete:**

```css
.autocomplete-dropdown {
  position: absolute;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  margin-top: -8px;
}

.autocomplete-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.autocomplete-item:hover,
.autocomplete-item.selected {
  background: var(--gray-50);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.user-email {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}
```

### 2.4 Highlight Mentions dans Affichage Commentaires

**Créer pipe `highlight-mentions.pipe.ts`:**

```typescript
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlightMentions',
  standalone: true
})
export class HighlightMentionsPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(content: string): SafeHtml {
    if (!content) return '';

    // Remplacer @username par <span class="mention">@username</span>
    const highlighted = content.replace(
      /@([a-zA-Z0-9._-]+)/g,
      '<span class="mention">@$1</span>'
    );

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
```

**Utiliser dans template:**

```html
<p class="comment-content" [innerHTML]="comment.content | highlightMentions"></p>
```

**Styles mentions:**

```css
.comment-content .mention {
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.comment-content .mention:hover {
  opacity: 0.8;
  text-decoration: underline;
}
```

---

## 🚀 PHASE 3: WebSocket pour Notifications Temps Réel

### 3.1 Backend - Configuration WebSocket

#### Ajouter dépendance Maven (pom.xml)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

#### Créer `config/WebSocketConfig.java`

```java
package com.catsbanque.mabanquetools.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Broker simple pour envoyer messages aux clients
        config.enableSimpleBroker("/topic", "/user");

        // Prefix pour messages depuis client vers serveur
        config.setApplicationDestinationPrefixes("/app");

        // Prefix pour messages user-specific
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint WebSocket avec fallback SockJS
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:4200")
                .withSockJS();
    }
}
```

#### Modifier `BlogNotificationService` - Broadcast WebSocket

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class BlogNotificationService {

    private final BlogNotificationRepository blogNotificationRepository;
    private final SimpMessagingTemplate messagingTemplate; // NOUVEAU

    @Transactional
    public void createMentionNotification(User recipient, User triggeredBy, String postId, String commentId, String customMessage) {
        BlogNotification notification = BlogNotification.builder()
                .type(NotificationType.MENTION)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId(postId)
                .relatedCommentId(commentId)
                .message(customMessage != null ? customMessage : "Vous a mentionné")
                .isRead(false)
                .build();

        notification = blogNotificationRepository.save(notification);
        log.info("Notification MENTION créée pour {} par {}", recipient.getEmail(), triggeredBy.getEmail());

        // ===== NOUVEAU: Envoyer via WebSocket =====
        BlogNotificationDto dto = toDto(notification);
        messagingTemplate.convertAndSendToUser(
            recipient.getId(),
            "/topic/notifications",
            dto
        );
        log.info("Notification MENTION envoyée via WebSocket à {}", recipient.getId());
        // ==========================================
    }

    // Répéter pour toutes les méthodes create*Notification
}
```

### 3.2 Frontend - WebSocket Client

#### Installer dependencies

```bash
npm install @stomp/stompjs sockjs-client
npm install --save-dev @types/sockjs-client
```

#### Modifier `blog-notification.service.ts` - Ajouter WebSocket

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BlogNotificationService {
  private apiUrl = '/api/blog/notifications';
  private wsClient: Client | null = null;

  private notificationsSubject = new BehaviorSubject<BlogNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadNotifications();
    this.loadUnreadCount();
    this.connectWebSocket();
  }

  private connectWebSocket(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.warn('No authenticated user, skipping WebSocket connection');
      return;
    }

    this.wsClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:3000/api/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('WebSocket connected');

        // S'abonner aux notifications user-specific
        this.wsClient?.subscribe(
          `/user/${currentUser.id}/topic/notifications`,
          (message: IMessage) => {
            const notification: BlogNotification = JSON.parse(message.body);
            console.log('New notification received:', notification);

            // Ajouter au début de la liste
            const current = this.notificationsSubject.value;
            this.notificationsSubject.next([notification, ...current]);

            // Incrémenter unread count
            this.unreadCountSubject.next(this.unreadCountSubject.value + 1);

            // Afficher toast (optionnel)
            this.showToast(notification);
          }
        );
      },

      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
      }
    });

    this.wsClient.activate();
  }

  private showToast(notification: BlogNotification): void {
    // Intégration avec ToastService (optionnel)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nouvelle notification', {
        body: `${notification.triggeredByName} ${notification.message}`,
        icon: '/assets/logo.png'
      });
    }
  }

  disconnect(): void {
    this.wsClient?.deactivate();
  }

  // ... reste du code
}
```

#### Demander permission notifications browser (optionnel)

Dans `app.component.ts`:

```typescript
ngOnInit(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
```

---

## 🚀 PHASE 4: Newsletter Hebdomadaire (PRIORITÉ BASSE)

### 4.1 Backend - Service Newsletter

#### Créer `BlogNewsletterService.java`

```java
package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.entity.BlogPost;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.repository.BlogPostRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogNewsletterService {

    private final BlogPostRepository blogPostRepository;
    private final UserRepository userRepository;
    // TODO: Ajouter EmailService pour envoi emails

    /**
     * Envoi newsletter hebdomadaire - Tous les lundis à 9h
     * Cron: "0 0 9 * * MON" = Sec Min Hour Day Month DayOfWeek
     */
    @Scheduled(cron = "0 0 9 * * MON")
    public void sendWeeklyNewsletter() {
        log.info("Démarrage envoi newsletter hebdomadaire");

        // Récupérer articles des 7 derniers jours
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        List<BlogPost> recentPosts = blogPostRepository.findPublishedPostsSince(oneWeekAgo);

        if (recentPosts.isEmpty()) {
            log.info("Aucun article publié cette semaine, newsletter annulée");
            return;
        }

        // Récupérer tous les utilisateurs (ou ceux abonnés)
        List<User> subscribers = userRepository.findAll(); // TODO: Filter par newsletter_subscribed = true

        // Générer HTML email
        String emailHtml = generateNewsletterHtml(recentPosts);

        // Envoyer email à chaque subscriber
        for (User subscriber : subscribers) {
            try {
                sendEmail(subscriber.getEmail(), "Newsletter hebdomadaire - Ma Banque Blog", emailHtml);
                log.info("Newsletter envoyée à {}", subscriber.getEmail());
            } catch (Exception e) {
                log.error("Erreur envoi newsletter à {}: {}", subscriber.getEmail(), e.getMessage());
            }
        }

        log.info("Newsletter hebdomadaire envoyée à {} destinataires", subscribers.size());
    }

    private String generateNewsletterHtml(List<BlogPost> posts) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head><meta charset='UTF-8'></head><body>");
        html.append("<h1>Cette semaine sur Ma Banque Blog</h1>");
        html.append("<p>Découvrez les nouveaux articles publiés cette semaine :</p>");

        for (BlogPost post : posts) {
            html.append("<div style='margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;'>");

            if (post.getCoverImage() != null) {
                html.append("<img src='").append(post.getCoverImage()).append("' style='max-width: 100%; border-radius: 4px;' />");
            }

            html.append("<h2>").append(post.getTitle()).append("</h2>");
            html.append("<p>").append(post.getExcerpt()).append("</p>");
            html.append("<p><strong>Par ").append(post.getAuthor().getFirstName()).append(" ")
                .append(post.getAuthor().getLastName()).append("</strong></p>");
            html.append("<a href='http://localhost:4200/blog/").append(post.getSlug()).append("' style='color: #10b981;'>Lire l'article →</a>");
            html.append("</div>");
        }

        html.append("<hr style='margin-top: 32px;' />");
        html.append("<p style='color: #6b7280; font-size: 12px;'>");
        html.append("Vous recevez cet email car vous êtes inscrit à la newsletter Ma Banque Blog. ");
        html.append("<a href='http://localhost:4200/blog/newsletter/unsubscribe'>Se désabonner</a>");
        html.append("</p>");
        html.append("</body></html>");

        return html.toString();
    }

    private void sendEmail(String to, String subject, String htmlContent) {
        // TODO: Implémenter avec JavaMailSender ou service tiers (SendGrid, Mailgun, etc.)
        log.info("Email envoyé (simulé) à {} avec sujet: {}", to, subject);
    }
}
```

#### Ajouter dans `BlogPostRepository.java`

```java
@Query("SELECT p FROM BlogPost p WHERE p.status = 'PUBLISHED' AND p.publishedAt >= :since ORDER BY p.publishedAt DESC")
List<BlogPost> findPublishedPostsSince(@Param("since") LocalDateTime since);
```

#### Activer scheduling dans `MaBanqueToolsApiApplication.java`

```java
@SpringBootApplication
@EnableScheduling // AJOUTER
public class MaBanqueToolsApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(MaBanqueToolsApiApplication.class, args);
    }
}
```

### 4.2 Endpoint Désinscription Newsletter

#### Ajouter dans `User` entity

```java
@Column(name = "newsletter_subscribed")
@Builder.Default
private Boolean newsletterSubscribed = true; // Opt-in par défaut
```

#### Créer controller endpoint

```java
@RestController
@RequestMapping("/blog/newsletter")
@RequiredArgsConstructor
public class BlogNewsletterController {

    private final UserRepository userRepository;

    @PostMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setNewsletterSubscribed(false);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Vous êtes désinscrit de la newsletter"));
    }

    @PostMapping("/subscribe")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<Map<String, String>> subscribe(HttpServletRequest request) {
        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setNewsletterSubscribed(true);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Vous êtes inscrit à la newsletter"));
    }
}
```

### 4.3 Frontend - Préférences Newsletter

Dans `settings.component.ts`, ajouter toggle newsletter:

```html
<div class="setting-item">
  <label>
    <input
      type="checkbox"
      [(ngModel)]="currentUser.newsletterSubscribed"
      (change)="toggleNewsletter()">
    Recevoir la newsletter hebdomadaire
  </label>
  <p class="setting-description">
    Recevez un récapitulatif des nouveaux articles chaque lundi matin
  </p>
</div>
```

---

## ✅ Checklist Tests

### Backend (JUnit)

#### Notifications
- [ ] `BlogNotificationServiceTest.getUserNotifications()` - Liste notifications OK
- [ ] `BlogNotificationServiceTest.getUnreadCount()` - Comptage OK
- [ ] `BlogNotificationServiceTest.markAsRead()` - Marquage lu OK
- [ ] `BlogNotificationServiceTest.markAsRead_wrongUser()` - Exception ownership
- [ ] `BlogNotificationServiceTest.markAllAsRead()` - Marquage multiple OK
- [ ] `BlogNotificationServiceTest.createMentionNotification()` - Création OK

#### Mentions @user
- [ ] `UserMentionParserTest.extractUsernames_single()` - 1 mention
- [ ] `UserMentionParserTest.extractUsernames_multiple()` - N mentions
- [ ] `UserMentionParserTest.extractUsernames_deduplicate()` - Pas de doublons
- [ ] `UserMentionParserTest.extractMentions_validUsers()` - Résolution DB OK
- [ ] `UserMentionParserTest.highlightMentions()` - HTML wrapping OK
- [ ] `BlogCommentServiceTest.createComment_withMentions()` - Notifications créées

#### Newsletter
- [ ] `BlogNewsletterServiceTest.sendWeeklyNewsletter()` - Envoi OK
- [ ] `BlogNewsletterServiceTest.sendWeeklyNewsletter_noPosts()` - Skip si vide
- [ ] `BlogNewsletterControllerTest.unsubscribe()` - Désinscription OK
- [ ] `BlogNewsletterControllerTest.subscribe()` - Inscription OK

### Frontend (Jest)

#### Notifications
- [ ] `NotificationBellComponent.toggleDropdown()` - Ouverture/fermeture
- [ ] `NotificationBellComponent.markAsRead()` - Marquage individuel
- [ ] `NotificationBellComponent.markAllAsRead()` - Marquage multiple
- [ ] `NotificationBellComponent.handleNotificationClick()` - Navigation OK
- [ ] `NotificationBellComponent.formatTime()` - Formatage temps relatif
- [ ] `BlogNotificationService.loadNotifications()` - Chargement OK
- [ ] `BlogNotificationService.loadUnreadCount()` - Comptage OK
- [ ] `BlogNotificationService.connectWebSocket()` - Connexion WS OK

#### Mentions @user
- [ ] `BlogPostViewComponent.onCommentInput()` - Détection @ OK
- [ ] `BlogPostViewComponent.onCommentKeydown()` - Navigation clavier OK
- [ ] `BlogPostViewComponent.insertMention()` - Insertion username OK
- [ ] `HighlightMentionsPipe.transform()` - Highlight bleu OK

---

## 📊 Estimation Temps

| Phase | Feature | Backend | Frontend | Tests | Total |
|-------|---------|---------|----------|-------|-------|
| 1 | Mentions @user | 2h | 3h | 2h | **7h** |
| 2 | Notifications + WebSocket | 2h | 4h | 2h | **8h** |
| 3 | Newsletter hebdomadaire | 1h | 1h | 1h | **3h** |
| **TOTAL** | | **5h** | **8h** | **5h** | **18h** |

---

## 🎯 Ordre d'Implémentation Recommandé

1. **Phase 1.1-1.3** : Mentions @user backend (Parser + Service + Controller) - 2h
2. **Phase 2.1-2.3** : Frontend autocomplete mentions - 3h
3. **Phase 1.4** : Tests backend mentions - 1h
4. **Phase 2.4** : Tests frontend mentions - 1h
5. **Phase 2** : Système notifications complet (Service + Controller + Bell component) - 6h
6. **Phase 3** : WebSocket temps réel - 2h
7. **Phase 4** : Newsletter (optionnel, basse priorité) - 3h

**Total MVP (sans newsletter):** ~15h
**Total complet:** ~18h

---

**Date création:** 2024-12-25
**Priorité:** HAUTE (Mentions) / MOYENNE (Notifications) / BASSE (Newsletter)
