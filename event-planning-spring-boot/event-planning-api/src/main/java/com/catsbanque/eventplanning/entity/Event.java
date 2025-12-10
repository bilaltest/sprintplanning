package com.catsbanque.eventplanning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "event", indexes = {
    @Index(name = "idx_event_date", columnList = "date"),
    @Index(name = "idx_event_category", columnList = "category")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @Column(length = 25)
    private String id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 10)
    private String date; // ISO format YYYY-MM-DD (start date)

    @Column(length = 10)
    private String endDate; // ISO format YYYY-MM-DD (optional end date for periods)

    @Column(length = 5)
    private String startTime; // HH:mm format

    @Column(length = 5)
    private String endTime; // HH:mm format

    @Column(nullable = false, length = 20)
    private String color;

    @Column(nullable = false, length = 50)
    private String icon;

    @Column(nullable = false, length = 50)
    private String category; // 'mep', 'hotfix', 'maintenance', 'pi_planning', 'sprint_start', 'code_freeze', 'psi', 'other'

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString().replace("-", "");
        }
    }
}
