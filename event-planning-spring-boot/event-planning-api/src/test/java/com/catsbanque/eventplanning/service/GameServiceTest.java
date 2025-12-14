package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.*;
import com.catsbanque.eventplanning.entity.Game;
import com.catsbanque.eventplanning.entity.GameScore;
import com.catsbanque.eventplanning.entity.User;
import com.catsbanque.eventplanning.exception.BadRequestException;
import com.catsbanque.eventplanning.exception.ResourceNotFoundException;
import com.catsbanque.eventplanning.exception.UnauthorizedException;
import com.catsbanque.eventplanning.repository.GameRepository;
import com.catsbanque.eventplanning.repository.GameScoreRepository;
import com.catsbanque.eventplanning.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock
    private GameRepository gameRepository;

    @Mock
    private GameScoreRepository gameScoreRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @InjectMocks
    private GameService gameService;

    private Game testGame;
    private User testUser;
    private GameScore testScore;

    @BeforeEach
    void setUp() {
        testGame = new Game();
        testGame.setId("game123");
        testGame.setSlug("typing-fr");
        testGame.setName("Typing Challenge FR");
        testGame.setDescription("Test your typing skills");
        testGame.setIcon("keyboard");
        testGame.setIsActive(true);

        testUser = new User();
        testUser.setId("user123");
        testUser.setEmail("test@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");

        testScore = new GameScore();
        testScore.setId("score123");
        testScore.setGameId("game123");
        testScore.setUserId("user123");
        testScore.setScore(100);
        testScore.setWpm(50);
        testScore.setAccuracy(95.5);
        testScore.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void getAllGames_ShouldReturnActiveGames() {
        // Given
        when(gameRepository.findByIsActiveTrueOrderByCreatedAtAsc())
                .thenReturn(Arrays.asList(testGame));

        // When
        List<Game> result = gameService.getAllGames();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSlug()).isEqualTo("typing-fr");
    }

    @Test
    void getGameBySlug_WhenExists_ShouldReturnGame() {
        // Given
        when(gameRepository.findBySlug("typing-fr")).thenReturn(Optional.of(testGame));

        // When
        Game result = gameService.getGameBySlug("typing-fr");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Typing Challenge FR");
    }

    @Test
    void getGameBySlug_WhenNotFound_ShouldThrowException() {
        // Given
        when(gameRepository.findBySlug("unknown")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> gameService.getGameBySlug("unknown"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Game not found");
    }

    @Test
    void getLeaderboard_ShouldReturnTop10() {
        // Given
        when(gameRepository.findBySlug("typing-fr")).thenReturn(Optional.of(testGame));
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);

        LocalDateTime now = LocalDateTime.now();
        Timestamp timestamp = Timestamp.valueOf(now);

        Object[] row1 = new Object[]{
                "score1", "game123", "user123", null, 100, 50, 95.5,
                timestamp, "John", "Doe", "test@example.com"
        };
        Object[] row2 = new Object[]{
                "score2", "game123", "user456", null, 80, 40, 90.0,
                timestamp, "Jane", "Smith", "jane@example.com"
        };

        when(query.getResultList()).thenReturn(Arrays.asList(row1, row2));

        // When
        List<LeaderboardEntry> result = gameService.getLeaderboard("typing-fr");

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getRank()).isEqualTo(1);
        assertThat(result.get(0).getScore()).isEqualTo(100);
        assertThat(result.get(0).getUser().getFirstName()).isEqualTo("John");
        assertThat(result.get(1).getRank()).isEqualTo(2);
        assertThat(result.get(1).getScore()).isEqualTo(80);
    }

    @Test
    void getLeaderboard_WhenGameNotFound_ShouldThrowException() {
        // Given
        when(gameRepository.findBySlug("unknown")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> gameService.getLeaderboard("unknown"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void submitScore_WithValidData_ShouldSaveAndReturnResponse() {
        // Given
        when(gameRepository.findBySlug("typing-fr")).thenReturn(Optional.of(testGame));
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(gameScoreRepository.save(any(GameScore.class))).thenReturn(testScore);
        when(gameScoreRepository.findFirstByGameIdAndUserIdOrderByScoreDesc("game123", "user123"))
                .thenReturn(Optional.of(testScore));

        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.getSingleResult()).thenReturn(BigInteger.valueOf(5));

        SubmitScoreRequest request = new SubmitScoreRequest();
        request.setScore(100);
        request.setWpm(50);
        request.setAccuracy(95.5);

        // When
        SubmitScoreResponse result = gameService.submitScore("typing-fr", request, "user123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getScore()).isEqualTo(100);
        assertThat(result.getRank()).isEqualTo(6);
        assertThat(result.getUser().getFirstName()).isEqualTo("John");
        verify(gameScoreRepository).save(any(GameScore.class));
    }

    @Test
    void submitScore_WithInvalidScore_ShouldThrowException() {
        // Given
        SubmitScoreRequest request = new SubmitScoreRequest();
        request.setScore(-1);

        // When & Then
        assertThatThrownBy(() -> gameService.submitScore("typing-fr", request, "user123"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid score");
    }

    @Test
    void submitScore_WithNullScore_ShouldThrowException() {
        // Given
        SubmitScoreRequest request = new SubmitScoreRequest();
        request.setScore(null);

        // When & Then
        assertThatThrownBy(() -> gameService.submitScore("typing-fr", request, "user123"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid score");
    }

    @Test
    void submitScore_WithoutAuth_ShouldThrowException() {
        // Given
        when(gameRepository.findBySlug("typing-fr")).thenReturn(Optional.of(testGame));

        SubmitScoreRequest request = new SubmitScoreRequest();
        request.setScore(100);

        // When & Then
        assertThatThrownBy(() -> gameService.submitScore("typing-fr", request, null))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Authentication required");
    }

    @Test
    void submitScore_WhenGameNotFound_ShouldThrowException() {
        // Given
        when(gameRepository.findBySlug("unknown")).thenReturn(Optional.empty());

        SubmitScoreRequest request = new SubmitScoreRequest();
        request.setScore(100);

        // When & Then
        assertThatThrownBy(() -> gameService.submitScore("unknown", request, "user123"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void submitScore_WhenUserNotFound_ShouldThrowException() {
        // Given
        when(gameRepository.findBySlug("typing-fr")).thenReturn(Optional.of(testGame));
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        SubmitScoreRequest request = new SubmitScoreRequest();
        request.setScore(100);

        // When & Then
        assertThatThrownBy(() -> gameService.submitScore("typing-fr", request, "user123"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getMyScores_ShouldReturnUserScores() {
        // Given
        when(gameRepository.findBySlug("typing-fr")).thenReturn(Optional.of(testGame));
        when(gameScoreRepository.findTop10ByGameIdAndUserIdOrderByCreatedAtDesc("game123", "user123"))
                .thenReturn(Arrays.asList(testScore));
        when(gameScoreRepository.findFirstByGameIdAndUserIdOrderByScoreDesc("game123", "user123"))
                .thenReturn(Optional.of(testScore));

        // When
        MyScoresResponse result = gameService.getMyScores("typing-fr", "user123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getBestScore()).isEqualTo(100);
        assertThat(result.getGamesPlayed()).isEqualTo(1);
        assertThat(result.getScores()).hasSize(1);
    }

    @Test
    void getMyScores_WithoutAuth_ShouldThrowException() {
        // When & Then
        assertThatThrownBy(() -> gameService.getMyScores("typing-fr", null))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Authentication required");
    }

    @Test
    void getMyScores_WhenGameNotFound_ShouldThrowException() {
        // Given
        when(gameRepository.findBySlug("unknown")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> gameService.getMyScores("unknown", "user123"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getMyScores_WithNoScores_ShouldReturnEmptyList() {
        // Given
        when(gameRepository.findBySlug("typing-fr")).thenReturn(Optional.of(testGame));
        when(gameScoreRepository.findTop10ByGameIdAndUserIdOrderByCreatedAtDesc("game123", "user123"))
                .thenReturn(Collections.emptyList());
        when(gameScoreRepository.findFirstByGameIdAndUserIdOrderByScoreDesc("game123", "user123"))
                .thenReturn(Optional.empty());

        // When
        MyScoresResponse result = gameService.getMyScores("typing-fr", "user123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getBestScore()).isEqualTo(0);
        assertThat(result.getGamesPlayed()).isEqualTo(0);
        assertThat(result.getScores()).isEmpty();
    }

    @Test
    void initGames_ShouldCreateOrUpdateGames() {
        // Given
        when(gameRepository.findBySlug(anyString())).thenReturn(Optional.empty());
        when(gameRepository.save(any(Game.class))).thenReturn(testGame);
        when(gameRepository.findAll()).thenReturn(Arrays.asList(testGame));

        // When
        List<Game> result = gameService.initGames();

        // Then
        assertThat(result).isNotEmpty();
        verify(gameRepository, atLeast(5)).save(any(Game.class));
    }

    @Test
    void initGames_WhenGamesExist_ShouldUpdate() {
        // Given
        when(gameRepository.findBySlug("typing-fr")).thenReturn(Optional.of(testGame));
        when(gameRepository.save(any(Game.class))).thenReturn(testGame);
        when(gameRepository.findAll()).thenReturn(Arrays.asList(testGame));

        // When
        List<Game> result = gameService.initGames();

        // Then
        assertThat(result).isNotEmpty();
        verify(gameRepository, atLeast(1)).save(any(Game.class));
    }
}
