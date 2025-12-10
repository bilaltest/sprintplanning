package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.FeatureFlipping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeatureFlippingRepository extends JpaRepository<FeatureFlipping, String> {

    /**
     * Find feature flipping by action ID (unique)
     */
    Optional<FeatureFlipping> findByActionId(String actionId);

    /**
     * Find feature flipping by rule name
     */
    Optional<FeatureFlipping> findByRuleName(String ruleName);

    /**
     * Check if action has feature flipping
     */
    boolean existsByActionId(String actionId);
}
