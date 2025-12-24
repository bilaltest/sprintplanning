package com.catsbanque.mabanquetools.entity;

import com.catsbanque.mabanquetools.util.Cuid;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_onboarding_status", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "feature_key" })
}, indexes = {
        @Index(name = "idx_onboarding_user", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserOnboardingStatus {

    @Id
    @Cuid
    @Column(length = 25)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "onboardingStatuses" })
    private User user;

    @Column(name = "feature_key", nullable = false, length = 50)
    private String featureKey;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime seenAt;

    public UserOnboardingStatus(User user, String featureKey) {
        this.user = user;
        this.featureKey = featureKey;
    }
}
