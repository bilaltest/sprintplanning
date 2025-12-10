package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.GameScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameScoreRepository extends JpaRepository<GameScore, String> {

    /**
     * Find scores by game ID ordered by score descending (leaderboard)
     */
    List<GameScore> findByGameIdOrderByScoreDescCreatedAtDesc(String gameId);

    /**
     * Find top N scores for a game
     */
    @Query("SELECT gs FROM GameScore gs WHERE gs.gameId = :gameId ORDER BY gs.score DESC, gs.createdAt DESC")
    List<GameScore> findTopScoresByGameId(@Param("gameId") String gameId);

    /**
     * Find scores by user ID
     */
    List<GameScore> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * Find user's best score for a game
     */
    @Query("SELECT gs FROM GameScore gs WHERE gs.gameId = :gameId AND gs.userId = :userId ORDER BY gs.score DESC")
    List<GameScore> findBestScoreByGameIdAndUserId(@Param("gameId") String gameId, @Param("userId") String userId);

    /**
     * Find first (best) score by game and user
     * Used to get user's best score
     */
    Optional<GameScore> findFirstByGameIdAndUserIdOrderByScoreDesc(String gameId, String userId);

    /**
     * Find top 10 scores by game and user ordered by creation date descending
     * Used for my-scores endpoint
     */
    List<GameScore> findTop10ByGameIdAndUserIdOrderByCreatedAtDesc(String gameId, String userId);
}
