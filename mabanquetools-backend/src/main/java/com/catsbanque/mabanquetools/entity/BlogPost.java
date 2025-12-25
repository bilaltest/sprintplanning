package com.catsbanque.mabanquetools.entity;

import com.catsbanque.mabanquetools.util.Cuid;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "blog_post", indexes = {
        @Index(name = "idx_blog_post_slug", columnList = "slug"),
        @Index(name = "idx_blog_post_status", columnList = "status"),
        @Index(name = "idx_blog_post_author", columnList = "author_id"),
        @Index(name = "idx_blog_post_created", columnList = "created_at"),
        @Index(name = "idx_blog_post_published", columnList = "published_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogPost {

    @Id
    @Cuid
    @Column(length = 25)
    private String id;

    @Column(nullable = false, unique = true, length = 255)
    private String slug; // URL-friendly version du titre (ex: "migration-squad-3-succes")

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String excerpt; // Court résumé (150-200 chars), généré auto ou manuel

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String content; // HTML riche (éditeur Quill)

    @Column(length = 500)
    private String coverImage; // URL de l'image de couverture

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BlogPostStatus status = BlogPostStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "like_count")
    @Builder.Default
    private Integer likeCount = 0;

    // Relations
    @OneToMany(mappedBy = "blogPost", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<BlogComment> comments = new ArrayList<>();

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "blog_post_tags",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<BlogTag> tags = new HashSet<>();

    @OneToMany(mappedBy = "blogPost", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BlogLike> likes = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Méthodes utilitaires
    @Transient
    public int getCommentCount() {
        return comments != null ? comments.size() : 0;
    }

    @Transient
    public boolean isPublished() {
        return status == BlogPostStatus.PUBLISHED;
    }

    @Transient
    public boolean isDraft() {
        return status == BlogPostStatus.DRAFT;
    }
}
