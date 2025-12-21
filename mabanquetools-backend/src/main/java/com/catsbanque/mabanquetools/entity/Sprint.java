package com.catsbanque.mabanquetools.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.catsbanque.mabanquetools.util.Cuid;

import java.time.LocalDateTime;

@Entity
@Table(name = "sprint", indexes = {
        @Index(name = "idx_sprint_dates", columnList = "startDate, endDate")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sprint {

    @Id
    @Cuid
    @Column(length = 25)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 10)
    private String startDate; // YYYY-MM-DD

    @Column(nullable = false, length = 10)
    private String endDate; // YYYY-MM-DD

    @Column(nullable = false, length = 10)
    private String codeFreezeDate; // YYYY-MM-DD

    @JsonProperty("releaseDateBack")
    @Column(name = "release_date_back", nullable = false, length = 10)
    private String releaseDateBack; // YYYY-MM-DD

    @JsonProperty("releaseDateFront")
    @Column(name = "release_date_front", nullable = false, length = 10)
    private String releaseDateFront; // YYYY-MM-DD

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}
