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
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "blog_tag", indexes = {
        @Index(name = "idx_tag_slug", columnList = "slug")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogTag {

    @Id
    @Cuid
    @Column(length = 25)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug; // URL-friendly version du nom

    @Column(length = 7)
    private String color; // Hex color (ex: #10b981)

    @ManyToMany(mappedBy = "tags")
    private Set<BlogPost> posts = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Méthode utilitaire pour compter les posts
    @Transient
    public int getPostCount() {
        return posts != null ? posts.size() : 0;
    }
}
