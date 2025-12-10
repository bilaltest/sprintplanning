package com.catsbanque.eventplanning.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "feature_flipping", indexes = {
    @Index(name = "idx_ff_action_id", columnList = "action_id"),
    @Index(name = "idx_ff_rule_name", columnList = "rule_name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeatureFlipping {

    @Id
    @Column(length = 25)
    private String id;

    @Column(name = "action_id", nullable = false, unique = true, length = 25)
    private String actionId;

    @Column(name = "flipping_type", nullable = false, length = 50)
    private String flippingType; // 'memory_flipping', 'feature_flipping', extensible

    @Column(name = "rule_name", nullable = false, length = 255)
    private String ruleName; // Rule name in the repository

    @Column(length = 100)
    private String theme; // FF/MF theme

    @Column(name = "rule_action", nullable = false, length = 50)
    private String ruleAction; // 'create_rule', 'obsolete_rule', 'disable_rule', 'enable_rule'

    @Column(name = "rule_state", length = 20)
    private String ruleState; // 'enabled', 'disabled' (deprecated, kept for backward compatibility)

    // Scopes (JSON stored as String)
    @Column(name = "target_clients", nullable = false, columnDefinition = "TEXT")
    private String targetClients = "[]"; // ["all"] or list of CAELs

    @Column(name = "target_caisses", columnDefinition = "TEXT")
    private String targetCaisses; // Free text list of caisses

    @Column(name = "target_os", nullable = false, columnDefinition = "TEXT")
    private String targetOS = "[]"; // ["ios", "android"] or empty for all

    @Column(name = "target_versions", nullable = false, columnDefinition = "TEXT")
    private String targetVersions = "[]"; // Version conditions [{"operator": ">=", "version": "38.5"}]

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Relationship
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id", insertable = false, updatable = false)
    private Action action;

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
