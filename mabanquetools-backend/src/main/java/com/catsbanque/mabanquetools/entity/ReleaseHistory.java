package com.catsbanque.mabanquetools.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import com.catsbanque.mabanquetools.util.Cuid;

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
    @Cuid
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

    public void setUser(User user) {
        this.user = user;
        this.userId = user != null ? user.getId() : null;
    }

}
