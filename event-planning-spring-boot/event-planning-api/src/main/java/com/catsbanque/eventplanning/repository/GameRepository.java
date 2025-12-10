package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, String> {

    /**
     * Find game by slug (unique)
     */
    Optional<Game> findBySlug(String slug);

    /**
     * Find all active games ordered by name
     */
    List<Game> findByIsActiveOrderByNameAsc(Boolean isActive);

    /**
     * Find all active games ordered by creation date
     * Used for GET /api/games
     */
    List<Game> findByIsActiveTrueOrderByCreatedAtAsc();

    /**
     * Check if slug exists
     */
    boolean existsBySlug(String slug);
}
