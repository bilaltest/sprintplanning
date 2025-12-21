package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.Game;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class GameRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private GameRepository gameRepository;

    private Game game1;
    private Game game2;

    @BeforeEach
    void setUp() {
        game1 = new Game();
        game1.setSlug("typing-fr");
        game1.setName("Typing Challenge FR");
        game1.setDescription("French typing speed test");
        game1.setIcon("keyboard");
        game1.setIsActive(true);

        game2 = new Game();
        game2.setSlug("typing-en");
        game2.setName("Typing Challenge EN");
        game2.setDescription("English typing speed test");
        game2.setIcon("keyboard");
        game2.setIsActive(false);
    }

    @Test
    void shouldFindGameBySlug() {
        // Given
        entityManager.persist(game1);
        entityManager.persist(game2);
        entityManager.flush();

        // When
        Optional<Game> found = gameRepository.findBySlug("typing-fr");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Typing Challenge FR");
    }

    @Test
    void shouldFindActiveGames() {
        // Given
        entityManager.persist(game1);
        entityManager.persist(game2);
        entityManager.flush();

        // When
        List<Game> activeGames = gameRepository.findByIsActiveOrderByNameAsc(true);
        List<Game> inactiveGames = gameRepository.findByIsActiveOrderByNameAsc(false);

        // Then
        assertThat(activeGames).hasSize(1);
        assertThat(activeGames.get(0).getSlug()).isEqualTo("typing-fr");
        assertThat(inactiveGames).hasSize(1);
    }

    @Test
    void shouldCheckIfSlugExists() {
        // Given
        entityManager.persist(game1);
        entityManager.flush();

        // When
        boolean exists = gameRepository.existsBySlug("typing-fr");
        boolean notExists = gameRepository.existsBySlug("nonexistent");

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    void shouldOrderGamesByName() {
        // Given
        game1.setName("Zebra Game");
        game2.setName("Alpha Game");
        game2.setIsActive(true);

        entityManager.persist(game1);
        entityManager.persist(game2);
        entityManager.flush();

        // When
        List<Game> games = gameRepository.findByIsActiveOrderByNameAsc(true);

        // Then
        assertThat(games).hasSize(2);
        assertThat(games.get(0).getName()).isEqualTo("Alpha Game");
        assertThat(games.get(1).getName()).isEqualTo("Zebra Game");
    }

    @Test
    void shouldUpdateGameStatus() {
        // Given
        Game saved = entityManager.persist(game1);
        entityManager.flush();

        // When
        saved.setIsActive(false);
        Game updated = gameRepository.save(saved);

        // Then
        assertThat(updated.getIsActive()).isFalse();
    }
}
