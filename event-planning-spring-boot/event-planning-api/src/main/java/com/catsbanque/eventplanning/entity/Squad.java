package com.catsbanque.eventplanning.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
            this.id = java.util.UUID.randomUUID().toString().replace("-", "");
        }
    }
}
