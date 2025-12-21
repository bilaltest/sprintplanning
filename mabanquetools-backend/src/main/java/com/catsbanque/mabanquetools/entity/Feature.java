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
import org.hibernate.annotations.UpdateTimestamp;
import com.catsbanque.mabanquetools.util.Cuid;

import java.time.LocalDateTime;

@Entity
@Table(name = "feature", indexes = {
        @Index(name = "idx_feature_squad_id", columnList = "squad_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feature {

    @Id
    @Cuid
    @Column(length = 25)
    private String id;

    @Column(name = "squad_id", nullable = false, length = 25)
    private String squadId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String type;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Relationship
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "squad_id", insertable = false, updatable = false)
    private Squad squad;

}
