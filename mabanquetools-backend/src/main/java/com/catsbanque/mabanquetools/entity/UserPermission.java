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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entité représentant les permissions d'un utilisateur pour un module
 * spécifique.
 *
 * Chaque utilisateur possède une permission par module (CALENDAR, RELEASES,
 * ADMIN)
 * avec un niveau de permission (NONE, READ, WRITE).
 */
@Entity
@Table(name = "user_permissions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_module", columnNames = { "user_id", "module" })
}, indexes = {
        @Index(name = "idx_user_permission_user_id", columnList = "user_id"),
        @Index(name = "idx_user_permission_module", columnList = "module")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPermission {

    @Id
    @Column(length = 25)
    private String id;

    @Column(name = "user_id", length = 25)
    private String userId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PermissionModule module;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PermissionLevel permissionLevel;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = generateCuid();
        }
    }

    // Simple CUID-like generator (for compatibility with Prisma)
    private String generateCuid() {
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * Integer.MAX_VALUE);
        return "c" + Long.toString(timestamp, 36) + Integer.toString(random, 36);
    }
}
