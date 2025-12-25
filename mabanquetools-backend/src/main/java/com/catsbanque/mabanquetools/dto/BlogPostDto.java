package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.BlogPost;
import com.catsbanque.mabanquetools.entity.BlogPostStatus;
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
public class BlogPostDto {

    private String id;
    private String slug;
    private String title;
    private String excerpt;
    private String content;
    private String coverImage;
    private BlogPostStatus status;

    // Auteur (nested object)
    private AuthorDto author;

    private LocalDateTime publishedAt;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;

    // Tags (liste simplifiée)
    private List<BlogTagDto> tags;

    // Flag si l'utilisateur courant a liké (sera enrichi côté service)
    private Boolean isLikedByCurrentUser;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Convertit une entité BlogPost en DTO.
     * Pattern existant dans le codebase (voir EventDto, ReleaseDto).
     */
    public static BlogPostDto fromEntity(BlogPost post) {
        if (post == null) {
            return null;
        }

        return BlogPostDto.builder()
                .id(post.getId())
                .slug(post.getSlug())
                .title(post.getTitle())
                .excerpt(post.getExcerpt())
                .content(post.getContent())
                .coverImage(post.getCoverImage())
                .status(post.getStatus())
                .author(AuthorDto.fromUser(post.getAuthor()))
                .publishedAt(post.getPublishedAt())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .tags(post.getTags() != null
                    ? post.getTags().stream()
                        .map(BlogTagDto::fromEntity)
                        .collect(Collectors.toList())
                    : List.of())
                .isLikedByCurrentUser(false) // Sera enrichi par le service
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    /**
     * DTO pour l'auteur d'un post (nested object).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthorDto {
        private String id;
        private String email;
        private String firstName;
        private String lastName;

        public static AuthorDto fromUser(com.catsbanque.mabanquetools.entity.User user) {
            if (user == null) {
                return null;
            }
            return AuthorDto.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .build();
        }
    }
}
