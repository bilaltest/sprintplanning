package com.catsbanque.eventplanning.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Random;

@Entity
@Table(name = "action", indexes = {
    @Index(name = "idx_action_squad_id", columnList = "squad_id"),
    @Index(name = "idx_action_phase", columnList = "phase"),
    @Index(name = "idx_action_type", columnList = "type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Action {

    @Id
    @Column(length = 25)
    private String id;

    @Column(name = "squad_id", nullable = false, length = 25)
    private String squadId;

    @Column(nullable = false, length = 20)
    private String phase; // 'pre_mep' or 'post_mep'

    @Column(nullable = false, length = 50)
    private String type; // 'topic_creation', 'database_update', 'vault_credentials', 'feature_flipping', 'other'

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String status = "pending"; // pending, completed

    @Column(nullable = false, name = "order_index")
    private Integer order = 0; // For ordering actions

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "squad_id", insertable = false, updatable = false)
    private Squad squad;

    @OneToOne(mappedBy = "action", cascade = CascadeType.ALL, orphanRemoval = true)
    private FeatureFlipping flipping;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = generateCuid();
        }
    }

    private static final String ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
    private static final Random random = new SecureRandom();

    private String generateCuid() {
        long timestamp = System.currentTimeMillis();
        StringBuilder cuid = new StringBuilder("c");
        cuid.append(Long.toString(timestamp, 36));
        for (int i = 0; i < 8; i++) {
            cuid.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return cuid.toString();
    }
}
