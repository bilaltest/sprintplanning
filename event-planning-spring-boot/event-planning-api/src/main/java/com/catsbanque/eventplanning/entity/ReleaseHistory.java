package com.catsbanque.eventplanning.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "release_history", indexes = {
    @Index(name = "idx_release_history_timestamp", columnList = "timestamp"),
    @Index(name = "idx_release_history_user_id", columnList = "user_id"),
    @Index(name = "idx_release_history_release_id", columnList = "release_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReleaseHistory {

    @Id
    @Column(length = 25)
    private String id;

    @Column(nullable = false, length = 50)
    private String action; // 'create', 'update', 'delete'

    @Column(name = "release_id", length = 25)
    private String releaseId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String releaseData; // JSON snapshot

    @Column(columnDefinition = "TEXT")
    private String previousData; // JSON for rollback

    @Column(name = "user_id", length = 25)
    private String userId;

    @Column(length = 100)
    private String userDisplayName; // Format: "Prenom N."

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    // Relationship
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = generateCuid();
        }
    }

    private String generateCuid() {
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * Integer.MAX_VALUE);
        return "c" + Long.toString(timestamp, 36) + Integer.toString(random, 36);
    }
}
