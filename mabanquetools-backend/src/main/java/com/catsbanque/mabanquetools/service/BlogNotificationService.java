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

/**
 * Service de gestion des notifications blog
 * Gère la création, lecture, et marquage des notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BlogNotificationService {

    private final BlogNotificationRepository blogNotificationRepository;

    /**
     * Récupérer toutes les notifications d'un utilisateur
     * @param userId ID de l'utilisateur
     * @return Liste de notifications (triées par date décroissante)
     */
    public List<BlogNotificationDto> getUserNotifications(String userId) {
        List<BlogNotification> notifications = blogNotificationRepository.findByRecipientId(userId);
        return notifications.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer les notifications non lues uniquement
     * @param userId ID de l'utilisateur
     * @return Liste de notifications non lues
     */
    public List<BlogNotificationDto> getUnreadNotifications(String userId) {
        List<BlogNotification> notifications = blogNotificationRepository.findUnreadByRecipientId(userId);
        return notifications.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Compter les notifications non lues
     * @param userId ID de l'utilisateur
     * @return Nombre de notifications non lues
     */
    public long getUnreadCount(String userId) {
        return blogNotificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    /**
     * Marquer une notification comme lue
     * @param notificationId ID de la notification
     * @param userId ID de l'utilisateur (pour vérification ownership)
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
     * @param userId ID de l'utilisateur
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
     * @param recipient Utilisateur qui reçoit la notification
     * @param triggeredBy Utilisateur qui a déclenché la notification
     * @param postId ID de l'article concerné
     * @param commentId ID du commentaire concerné (peut être null)
     * @param customMessage Message personnalisé (optionnel)
     */
    @Transactional
    public void createMentionNotification(User recipient, User triggeredBy, String postId, String commentId, String customMessage) {
        BlogNotification notification = BlogNotification.builder()
                .type(NotificationType.MENTION)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId(postId)
                .relatedCommentId(commentId)
                .message(customMessage != null ? customMessage : "vous a mentionné")
                .isRead(false)
                .build();

        blogNotificationRepository.save(notification);
        log.info("Notification MENTION créée pour {} par {}", recipient.getEmail(), triggeredBy.getEmail());
    }

    /**
     * Créer notification NEW_COMMENT
     * @param recipient Utilisateur qui reçoit la notification (auteur du post)
     * @param triggeredBy Utilisateur qui a commenté
     * @param postId ID de l'article
     * @param commentId ID du commentaire
     */
    @Transactional
    public void createCommentNotification(User recipient, User triggeredBy, String postId, String commentId) {
        BlogNotification notification = BlogNotification.builder()
                .type(NotificationType.NEW_COMMENT)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId(postId)
                .relatedCommentId(commentId)
                .message("a commenté votre article")
                .isRead(false)
                .build();

        blogNotificationRepository.save(notification);
        log.info("Notification NEW_COMMENT créée pour {} par {}", recipient.getEmail(), triggeredBy.getEmail());
    }

    /**
     * Créer notification COMMENT_REPLY
     * @param recipient Utilisateur qui reçoit la notification (auteur du commentaire parent)
     * @param triggeredBy Utilisateur qui a répondu
     * @param postId ID de l'article
     * @param commentId ID de la réponse
     */
    @Transactional
    public void createReplyNotification(User recipient, User triggeredBy, String postId, String commentId) {
        BlogNotification notification = BlogNotification.builder()
                .type(NotificationType.COMMENT_REPLY)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId(postId)
                .relatedCommentId(commentId)
                .message("a répondu à votre commentaire")
                .isRead(false)
                .build();

        blogNotificationRepository.save(notification);
        log.info("Notification COMMENT_REPLY créée pour {} par {}", recipient.getEmail(), triggeredBy.getEmail());
    }

    /**
     * Créer notification POST_LIKE
     * @param recipient Utilisateur qui reçoit la notification (auteur du post)
     * @param triggeredBy Utilisateur qui a liké
     * @param postId ID de l'article
     */
    @Transactional
    public void createPostLikeNotification(User recipient, User triggeredBy, String postId) {
        BlogNotification notification = BlogNotification.builder()
                .type(NotificationType.POST_LIKE)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId(postId)
                .message("a aimé votre article")
                .isRead(false)
                .build();

        blogNotificationRepository.save(notification);
        log.info("Notification POST_LIKE créée pour {} par {}", recipient.getEmail(), triggeredBy.getEmail());
    }

    /**
     * Créer notification COMMENT_LIKE
     * @param recipient Utilisateur qui reçoit la notification (auteur du commentaire)
     * @param triggeredBy Utilisateur qui a liké
     * @param postId ID de l'article
     * @param commentId ID du commentaire
     */
    @Transactional
    public void createCommentLikeNotification(User recipient, User triggeredBy, String postId, String commentId) {
        BlogNotification notification = BlogNotification.builder()
                .type(NotificationType.COMMENT_LIKE)
                .recipient(recipient)
                .triggeredBy(triggeredBy)
                .relatedPostId(postId)
                .relatedCommentId(commentId)
                .message("a aimé votre commentaire")
                .isRead(false)
                .build();

        blogNotificationRepository.save(notification);
        log.info("Notification COMMENT_LIKE créée pour {} par {}", recipient.getEmail(), triggeredBy.getEmail());
    }

    /**
     * Créer notification NEW_POST
     * @param recipient Utilisateur qui reçoit la notification (abonné)
     * @param author Auteur de l'article
     * @param postId ID de l'article
     */
    @Transactional
    public void createNewPostNotification(User recipient, User author, String postId) {
        BlogNotification notification = BlogNotification.builder()
                .type(NotificationType.NEW_POST)
                .recipient(recipient)
                .triggeredBy(author)
                .relatedPostId(postId)
                .message("a publié un nouvel article")
                .isRead(false)
                .build();

        blogNotificationRepository.save(notification);
        log.info("Notification NEW_POST créée pour {} (nouvel article de {})", recipient.getEmail(), author.getEmail());
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
