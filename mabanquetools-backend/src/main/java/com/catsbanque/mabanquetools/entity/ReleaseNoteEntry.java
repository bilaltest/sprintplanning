package com.catsbanque.mabanquetools.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.catsbanque.mabanquetools.util.Cuid;

import java.time.LocalDateTime;

@Entity
@Table(name = "release_note_entry", indexes = {
        @Index(name = "idx_release_note_release_id", columnList = "release_id"),
        @Index(name = "idx_release_note_squad", columnList = "squad"),
        @Index(name = "idx_release_note_deploy_order", columnList = "deploy_order")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReleaseNoteEntry {

    @Id
    @Cuid
    @Column(length = 25)
    private String id;

    @Column(name = "release_id", nullable = false, length = 25)
    private String releaseId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "release_id", insertable = false, updatable = false)
    private Release release;

    // ⚠️ DEPRECATED: Use microserviceId instead (kept for backward compatibility)
    @Column(length = 100)
    private String microservice; // Ex: "ms-auth" - Legacy field

    @Column(name = "microservice_id", length = 25)
    private String microserviceId; // FK to microservice table (preferred)

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "microservice_id", insertable = false, updatable = false)
    private Microservice microserviceEntity;

    @Column(nullable = false, length = 50)
    private String squad; // Ex: "Squad 1"

    @Column(name = "part_en_mep", nullable = false)
    private Boolean partEnMep = false; // Part en MEP ?

    @Column(name = "deploy_order")
    private Integer deployOrder; // Ordre de déploiement (nullable si partEnMep=false)

    @Column(length = 50)
    private String tag; // Ex: "v2.1.0"

    @Column(name = "previous_tag", length = 50)
    private String previousTag; // Ex: "v2.0.5" (tag N-1 en prod)

    @Column(name = "parent_version", length = 50)
    private String parentVersion; // Ex: "4.0.3"

    @Column(columnDefinition = "JSON")
    private String changes; // JSON: [{"jiraId": "BANK-1234", "description": "Fix auth"}]

    @Column(columnDefinition = "TEXT")
    private String comment; // Commentaire libre sur l'entrée

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private DeploymentStatus status = DeploymentStatus.HOM2; // Default to HOM2

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}
