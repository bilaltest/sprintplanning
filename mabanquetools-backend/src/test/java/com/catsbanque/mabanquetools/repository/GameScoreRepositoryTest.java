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
        game.setSlug("typing-fr");
        game.setName("Typing FR");
        game.setIcon("keyboard");
        game.setIsActive(true);
        entityManager.persist(game); // Persist first to generate ID

        user = new User();
        user.setEmail("test@example.com");
        user.setPassword("hashed");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setThemePreference("light");
        user.setWidgetOrder("[]");
        entityManager.persist(user); // Persist first to generate ID

        score1 = new GameScore();
        score1.setGameId(game.getId());
        score1.setUserId(user.getId());
        score1.setScore(85);
        score1.setWpm(60);
        score1.setAccuracy(95.5);

        score2 = new GameScore();
        score2.setGameId(game.getId());
        score2.setUserId(user.getId());
        score2.setScore(92);
        score2.setWpm(65);
        score2.setAccuracy(98.2);

        score3 = new GameScore();
        score3.setGameId(game.getId());
        score3.setVisitorName("Anonymous");
        score3.setScore(78);
        score3.setWpm(55);
        score3.setAccuracy(92.0);
    }

    @Test
    void shouldFindScoresByGameId() {
        // Given
        entityManager.persist(score1);
        entityManager.persist(score2);
        entityManager.persist(score3);
        entityManager.flush();

        // When
        List<GameScore> scores = gameScoreRepository.findByGameIdOrderByScoreDescCreatedAtDesc(game.getId());

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
        List<GameScore> topScores = gameScoreRepository.findTopScoresByGameId(game.getId());

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
        List<GameScore> userScores = gameScoreRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

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
        List<GameScore> bestScores = gameScoreRepository.findBestScoreByGameIdAndUserId(game.getId(), user.getId());

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
        List<GameScore> scores = gameScoreRepository.findByGameIdOrderByScoreDescCreatedAtDesc(game.getId());

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
        GameScore found = gameScoreRepository.findById(score1.getId()).orElse(null);

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
        GameScore found = gameScoreRepository.findById(score1.getId()).orElse(null);

        // Then
        assertThat(found).isNotNull();
        assertThat(found.getMetadata()).contains("mistakes");
        assertThat(found.getMetadata()).contains("duration");
    }
}
