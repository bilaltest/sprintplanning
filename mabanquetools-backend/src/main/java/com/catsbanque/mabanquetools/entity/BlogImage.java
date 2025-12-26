package com.catsbanque.mabanquetools.entity;

import com.catsbanque.mabanquetools.util.Cuid;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Base64;

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

    @Column(nullable = false, length = 255)
    private String originalFileName; // Nom original du fichier uploadé

    @Column(nullable = false, length = 20)
    private String mimeType; // image/jpeg, image/png, image/webp

    @Column(nullable = false)
    private Long fileSize; // Taille en bytes

    @Column(nullable = false)
    private Integer width; // Largeur image originale

    @Column(nullable = false)
    private Integer height; // Hauteur image originale

    // Stockage BLOB
    @Lob
    @Column(name = "image_data", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] imageData; // Image originale (max ~4GB MySQL LONGBLOB)

    @Lob
    @Column(name = "thumbnail_data", columnDefinition = "MEDIUMBLOB")
    private byte[] thumbnailData; // Thumbnail redimensionné (max ~16MB MySQL MEDIUMBLOB)

    @Column(nullable = false)
    private Integer thumbnailWidth; // Largeur thumbnail

    @Column(nullable = false)
    private Integer thumbnailHeight; // Hauteur thumbnail

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Méthodes transient pour générer data URLs
    @Transient
    public String getUrl() {
        if (imageData == null) return null;
        String base64 = Base64.getEncoder().encodeToString(imageData);
        return String.format("data:%s;base64,%s", mimeType, base64);
    }

    @Transient
    public String getThumbnailUrl() {
        if (thumbnailData == null) return null;
        String base64 = Base64.getEncoder().encodeToString(thumbnailData);
        return String.format("data:%s;base64,%s", mimeType, base64);
    }
}
