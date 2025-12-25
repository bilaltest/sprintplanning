package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.BlogComment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogCommentDto {

    private String id;
    private String postId;
    private String parentId; // ID du commentaire parent (null si commentaire de niveau 1)
    private String content;

    // Auteur (nested object)
    private AuthorDto author;

    private Integer likeCount;
    private Boolean isLikedByCurrentUser;

    // Réponses (thread support)
    private List<BlogCommentDto> replies;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Convertit une entité BlogComment en DTO.
     */
    public static BlogCommentDto fromEntity(BlogComment comment) {
        if (comment == null) {
            return null;
        }

        return BlogCommentDto.builder()
                .id(comment.getId())
                .postId(comment.getBlogPost().getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .content(comment.getContent())
                .author(AuthorDto.fromUser(comment.getAuthor()))
                .likeCount(comment.getLikeCount())
                .isLikedByCurrentUser(false) // Sera enrichi par le service
                .replies(comment.getReplies() != null
                    ? comment.getReplies().stream()
                        .map(BlogCommentDto::fromEntity)
                        .collect(Collectors.toList())
                    : List.of())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    /**
     * DTO pour l'auteur d'un commentaire (nested object).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthorDto {
        private String id;
        private String firstName;
        private String lastName;

        public static AuthorDto fromUser(com.catsbanque.mabanquetools.entity.User user) {
            if (user == null) {
                return null;
            }
            return AuthorDto.builder()
                    .id(user.getId())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .build();
        }
    }
}
