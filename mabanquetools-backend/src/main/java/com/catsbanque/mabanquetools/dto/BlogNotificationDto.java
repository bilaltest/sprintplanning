package com.catsbanque.mabanquetools.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour les notifications blog
 * Correspond à l'entité BlogNotification
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogNotificationDto {
    private String id;
    private String type; // NotificationType enum name (NEW_POST, NEW_COMMENT, COMMENT_REPLY, POST_LIKE, COMMENT_LIKE, MENTION)
    private String recipientId;
    private String triggeredById;
    private String triggeredByName; // Prénom + Nom de l'utilisateur qui a déclenché la notification
    private String relatedPostId;
    private String relatedCommentId;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
