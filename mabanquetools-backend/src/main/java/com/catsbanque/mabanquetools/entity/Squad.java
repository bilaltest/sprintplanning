package com.catsbanque.mabanquetools.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Entity
@Table(name = "squad", indexes = {
    @Index(name = "idx_squad_release_id", columnList = "release_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Squad {

    @Id
    @Column(length = 25)
    private String id;

    @Column(name = "squad_number", nullable = false)
    private Integer squadNumber; // 1 to 6

    @Column(name = "tonton_mep", length = 100)
    private String tontonMep; // Name of MEP supervisor for this squad

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false; // Calculated field

    @Column(name = "features_empty_confirmed", nullable = false)
    private Boolean featuresEmptyConfirmed = false;

    @Column(name = "pre_mep_empty_confirmed", nullable = false)
    private Boolean preMepEmptyConfirmed = false;

    @Column(name = "post_mep_empty_confirmed", nullable = false)
    private Boolean postMepEmptyConfirmed = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "release_id", nullable = false)
    private Release release;

    @OneToMany(mappedBy = "squad", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Feature> features = new ArrayList<>();

    @OneToMany(mappedBy = "squad", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Action> actions = new ArrayList<>();

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
