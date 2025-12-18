package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.Game;
import com.catsbanque.mabanquetools.entity.GameScore;
import com.catsbanque.mabanquetools.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class GameScoreRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private GameScoreRepository gameScoreRepository;

    private Game game;
    private User user;
    private GameScore score1;
    private GameScore score2;
    private GameScore score3;

    @BeforeEach
    void setUp() {
        game = new Game();
        game.setId("game-1");
        game.setSlug("typing-fr");
        game.setName("Typing FR");
        game.setIcon("keyboard");
        game.setIsActive(true);

        user = new User();
        user.setId("user-1");
        user.setEmail("test@example.com");
        user.setPassword("hashed");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setThemePreference("light");
        user.setWidgetOrder("[]");

        score1 = new GameScore();
        score1.setId("score-1");
        score1.setGameId("game-1");
        score1.setUserId("user-1");
        score1.setScore(85);
        score1.setWpm(60);
        score1.setAccuracy(95.5);

        score2 = new GameScore();
        score2.setId("score-2");
        score2.setGameId("game-1");
        score2.setUserId("user-1");
        score2.setScore(92);
        score2.setWpm(65);
        score2.setAccuracy(98.2);

        score3 = new GameScore();
        score3.setId("score-3");
        score3.setGameId("game-1");
        score3.setVisitorName("Anonymous");
        score3.setScore(78);
        score3.setWpm(55);
        score3.setAccuracy(92.0);

        entityManager.persist(game);
        entityManager.persist(user);
    }

    @Test
    void shouldFindScoresByGameId() {
        // Given
        entityManager.persist(score1);
        entityManager.persist(score2);
        entityManager.persist(score3);
        entityManager.flush();

        // When
        List<GameScore> scores = gameScoreRepository.findByGameIdOrderByScoreDescCreatedAtDesc("game-1");

        // Then
        assertThat(scores).hasSize(3);
        assertThat(scores.get(0).getScore()).isEqualTo(92);
        assertThat(scores.get(1).getScore()).isEqualTo(85);
        assertThat(scores.get(2).getScore()).isEqualTo(78);
    }

    @Test
    void shouldFindTopScoresByGameId() {
        // Given
        entityManager.persist(score1);
        entityManager.persist(score2);
        entityManager.persist(score3);
        entityManager.flush();

        // When
        List<GameScore> topScores = gameScoreRepository.findTopScoresByGameId("game-1");

        // Then
        assertThat(topScores).hasSize(3);
        assertThat(topScores.get(0).getScore()).isGreaterThanOrEqualTo(topScores.get(1).getScore());
    }

    @Test
    void shouldFindScoresByUserId() {
        // Given
        entityManager.persist(score1);
        entityManager.persist(score2);
        entityManager.persist(score3);
        entityManager.flush();

        // When
        List<GameScore> userScores = gameScoreRepository.findByUserIdOrderByCreatedAtDesc("user-1");

        // Then
        assertThat(userScores).hasSize(2);
        assertThat(userScores.get(0).getScore()).isIn(85, 92);
    }

    @Test
    void shouldFindBestScoreByGameIdAndUserId() {
        // Given
        entityManager.persist(score1);
        entityManager.persist(score2);
        entityManager.flush();

        // When
        List<GameScore> bestScores = gameScoreRepository.findBestScoreByGameIdAndUserId("game-1", "user-1");

        // Then
        assertThat(bestScores).isNotEmpty();
        assertThat(bestScores.get(0).getScore()).isEqualTo(92);
    }

    @Test
    void shouldHandleVisitorScores() {
        // Given
        entityManager.persist(score3);
        entityManager.flush();

        // When
        List<GameScore> scores = gameScoreRepository.findByGameIdOrderByScoreDescCreatedAtDesc("game-1");

        // Then
        assertThat(scores).hasSize(1);
        assertThat(scores.get(0).getVisitorName()).isEqualTo("Anonymous");
        assertThat(scores.get(0).getUserId()).isNull();
    }

    @Test
    void shouldStoreWpmAndAccuracy() {
        // Given
        entityManager.persist(score1);
        entityManager.flush();

        // When
        GameScore found = gameScoreRepository.findById("score-1").orElse(null);

        // Then
        assertThat(found).isNotNull();
        assertThat(found.getWpm()).isEqualTo(60);
        assertThat(found.getAccuracy()).isEqualTo(95.5);
    }

    @Test
    void shouldStoreMetadataAsJson() {
        // Given
        score1.setMetadata("{\"mistakes\":5,\"duration\":120}");
        entityManager.persist(score1);
        entityManager.flush();

        // When
        GameScore found = gameScoreRepository.findById("score-1").orElse(null);

        // Then
        assertThat(found).isNotNull();
        assertThat(found.getMetadata()).contains("mistakes");
        assertThat(found.getMetadata()).contains("duration");
    }
}
