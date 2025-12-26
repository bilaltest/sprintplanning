package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.BlogCommentDto;
import com.catsbanque.mabanquetools.dto.CreateBlogCommentRequest;
import com.catsbanque.mabanquetools.entity.BlogComment;
import com.catsbanque.mabanquetools.entity.BlogPost;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.exception.BadRequestException;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.BlogCommentRepository;
import com.catsbanque.mabanquetools.repository.BlogPostRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import com.catsbanque.mabanquetools.util.UserMentionParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogCommentService {

    private final BlogCommentRepository commentRepository;
    private final BlogPostRepository postRepository;
    private final UserRepository userRepository;
    private final UserMentionParser mentionParser;
    private final BlogNotificationService notificationService;

    /**
     * Récupère tous les commentaires top-level d'un post (sans parent).
     * Les réponses sont chargées en cascade via la relation @OneToMany.
     */
    @Transactional(readOnly = true)
    public List<BlogCommentDto> getCommentsByPostId(String postId) {
        log.info("Récupération des commentaires pour le post: {}", postId);

        // Vérifier que le post existe
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post non trouvé: " + postId);
        }

        List<BlogComment> comments = commentRepository.findTopLevelCommentsByPostId(postId);
        return comments.stream()
                .map(BlogCommentDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Crée un nouveau commentaire (top-level ou réponse).
     */
    @Transactional
    public BlogCommentDto createComment(CreateBlogCommentRequest request, String authorId) {
        log.info("Création d'un commentaire par l'utilisateur: {}", authorId);

        // Récupérer le post
        BlogPost post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post non trouvé: " + request.getPostId()));

        // Récupérer l'auteur
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + authorId));

        BlogComment comment = BlogComment.builder()
                .blogPost(post)
                .author(author)
                .content(request.getContent())
                .likeCount(0)
                .build();

        // Si c'est une réponse à un commentaire parent
        if (request.getParentId() != null) {
            BlogComment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Commentaire parent non trouvé: " + request.getParentId()));
            comment.setParent(parent);
            log.info("Commentaire créé en réponse à: {}", parent.getId());
        }

        BlogComment saved = commentRepository.save(comment);
        log.info("Commentaire créé avec succès: {}", saved.getId());

        // ===== NOTIFICATIONS =====

        // 1. Parser mentions @user et créer notifications MENTION
        List<User> mentionedUsers = mentionParser.extractMentions(request.getContent());
        for (User mentionedUser : mentionedUsers) {
            // Ne pas notifier si l'auteur se mentionne lui-même
            if (!mentionedUser.getId().equals(authorId)) {
                notificationService.createMentionNotification(
                    mentionedUser,
                    author,
                    post.getId(),
                    saved.getId(),
                    "vous a mentionné dans un commentaire"
                );
            }
        }

        // 2. Notifier l'auteur du post si c'est un commentaire top-level (et si différent de l'auteur du commentaire)
        if (request.getParentId() == null && !post.getAuthor().getId().equals(authorId)) {
            notificationService.createCommentNotification(
                post.getAuthor(),
                author,
                post.getId(),
                saved.getId()
            );
        }

        // 3. Notifier l'auteur du commentaire parent si c'est une réponse (et si différent de l'auteur)
        if (request.getParentId() != null) {
            BlogComment parent = commentRepository.findById(request.getParentId()).orElse(null);
            if (parent != null && !parent.getAuthor().getId().equals(authorId)) {
                notificationService.createReplyNotification(
                    parent.getAuthor(),
                    author,
                    post.getId(),
                    saved.getId()
                );
            }
        }

        // =========================

        return BlogCommentDto.fromEntity(saved);
    }

    /**
     * Supprime un commentaire.
     * Seul l'auteur ou un admin peut supprimer.
     */
    @Transactional
    public void deleteComment(String commentId, String currentUserId) {
        log.info("Suppression du commentaire: {} par utilisateur: {}", commentId, currentUserId);

        BlogComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire non trouvé: " + commentId));

        // Vérifier que l'utilisateur courant est l'auteur
        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new BadRequestException("Vous n'êtes pas autorisé à supprimer ce commentaire");
        }

        commentRepository.delete(comment);
        log.info("Commentaire supprimé avec succès: {}", commentId);
    }
}
