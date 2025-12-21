package com.catsbanque.mabanquetools.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "game_score", indexes = {
        @Index(name = "idx_game_score_game_id", columnList = "game_id,score"),
        @Index(name = "idx_game_score_user_id", columnList = "user_id"),
        @Index(name = "idx_game_score_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameScore {

    @Id
    @Column(length = 25)
    private String id;

    @Column(name = "game_id", nullable = false, length = 25)
    private String gameId;

    @Column(length = 100)
    private String visitorName; // For non-authenticated players (optional)

    @Column(name = "user_id", length = 25)
    private String userId;

    @Column(nullable = false)
    private Integer score; // Number of correct words

    private Integer wpm; // Words per minute

    private Double accuracy; // Accuracy percentage

    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON for additional data

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationships
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", insertable = false, updatable = false)
    private Game game;

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
