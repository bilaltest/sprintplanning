package com.catsbanque.mabanquetools.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.catsbanque.mabanquetools.util.Cuid;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "app_release", indexes = {
        @Index(name = "idx_release_date", columnList = "release_date"),
        @Index(name = "idx_release_status", columnList = "status"),
        @Index(name = "idx_release_type", columnList = "type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Release {

    @Id
    @Cuid
    @Column(length = 25)
    private String id;

    @Column(nullable = false, length = 255)
    private String name; // Ex: "Release v40.5 - Sprint 2024.12" (contient déjà la version)

    @Column(unique = true, length = 255)
    private String slug; // Ex: "release-v40-5-sprint-2024-12" (URL-friendly, unique) - nullable
                         // temporairement pour migration

    @Column(name = "release_date", nullable = false)
    private LocalDateTime releaseDate; // Planned MEP date

    @Column(nullable = false, length = 20)
    private String status = "draft"; // draft, in_progress, completed, cancelled

    @Column(nullable = false, length = 20)
    private String type = "release"; // release, hotfix

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "release", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Squad> squads = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "release", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReleaseNoteEntry> releaseNoteEntries = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.slug == null) {
            this.slug = generateSlug(this.name);
        }
    }

    @PreUpdate
    public void preUpdate() {
        // Regénérer le slug si le nom a changé
        if (this.name != null) {
            this.slug = generateSlug(this.name);
        }
    }

    /**
     * Génère un slug URL-friendly à partir d'un nom
     * Ex: "Release v40.5 - Sprint 2024.12" -> "release-v40-5-sprint-2024-12"
     */
    private String generateSlug(String name) {
        if (name == null || name.isEmpty()) {
            return "release-" + System.currentTimeMillis();
        }

        return name.toLowerCase()
                .replaceAll("[àáâãäå]", "a")
                .replaceAll("[èéêë]", "e")
                .replaceAll("[ìíîï]", "i")
                .replaceAll("[òóôõö]", "o")
                .replaceAll("[ùúûü]", "u")
                .replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9]+", "-") // Remplacer tout ce qui n'est pas alphanum par -
                .replaceAll("^-+|-+$", "") // Supprimer les - en début/fin
                .replaceAll("-+", "-"); // Remplacer multiple - par un seul
    }
}
