package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.UserOnboardingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserOnboardingStatusRepository extends JpaRepository<UserOnboardingStatus, String> {
    List<UserOnboardingStatus> findByUserId(String userId);

    boolean existsByUserIdAndFeatureKey(String userId, String featureKey);
}
