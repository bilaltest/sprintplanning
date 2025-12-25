package com.catsbanque.mabanquetools.entity;

import com.catsbanque.mabanquetools.util.Cuid;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "blog_image", indexes = {
        @Index(name = "idx_image_uploader", columnList = "uploaded_by_id"),
        @Index(name = "idx_image_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogImage {

    @Id
    @Cuid
    @Column(length = 25)
    private String id;

    @Column(nullable = false, unique = true, length = 500)
    private String fileName; // Nom du fichier sur le serveur (unique)

    @Column(nullable = false, length = 255)
    private String originalFileName; // Nom original du fichier uploadé

    @Column(nullable = false, length = 500)
    private String url; // URL complète de l'image

    @Column(length = 500)
    private String thumbnailUrl; // URL de la miniature (optionnel)

    @Column(nullable = false, length = 20)
    private String mimeType; // image/jpeg, image/png, image/webp

    @Column(nullable = false)
    private Long fileSize; // Taille en bytes

    @Column(nullable = false)
    private Integer width;

    @Column(nullable = false)
    private Integer height;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
