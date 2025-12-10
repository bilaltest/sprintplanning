package com.catsbanque.eventplanning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
    @Column(length = 25)
    private String id;

    @Column(nullable = false, length = 255)
    private String name; // Ex: "Release v40.5 - Sprint 2024.12"

    @Column(nullable = false, length = 20)
    private String version; // Ex: "40.5"

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

    // Relationship
    @OneToMany(mappedBy = "release", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Squad> squads = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString().replace("-", "");
        }
    }
}
