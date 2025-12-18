package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.LeaderboardEntry;
import com.catsbanque.eventplanning.dto.LeaderboardUser;
import com.catsbanque.eventplanning.dto.MyScoresResponse;
import com.catsbanque.eventplanning.dto.SubmitScoreRequest;
import com.catsbanque.eventplanning.dto.SubmitScoreResponse;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Service de gestion des jeux
 * Référence: game.controller.js
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final GameScoreRepository gameScoreRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    /**
     * Récupérer tous les jeux actifs
     * Référence: game.controller.js:5-16
     */
    @Transactional(readOnly = true)
    public List<Game> getAllGames() {
        return gameRepository.findByIsActiveTrueOrderByCreatedAtAsc();
    }

    /**
     * Récupérer un jeu par slug
     * Référence: game.controller.js:18-35
     */
    @Transactional(readOnly = true)
    public Game getGameBySlug(String slug) {
        return gameRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));
    }

    /**
     * Récupérer le classement Top 10
     * Référence: game.controller.js:37-102
     */
    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getLeaderboard(String slug) {
        Game game = gameRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        // Query SQL native pour récupérer le meilleur score de chaque utilisateur (une seule entrée par utilisateur)
        String sql = """
            SELECT
                gs.id as id,
                gs.game_id as gameId,
                gs.user_id as userId,
                gs.visitor_name as visitorName,
                gs.score as score,
                gs.wpm as wpm,
                gs.accuracy as accuracy,
                gs.created_at as createdAt,
                u.first_name as firstName,
                u.last_name as lastName,
                u.email as email
            FROM game_score gs
            LEFT JOIN app_user u ON gs.user_id = u.id
            WHERE gs.game_id = :gameId
            AND gs.id = (
                SELECT gs2.id
                FROM game_score gs2
                WHERE gs2.game_id = gs.game_id
                AND (
                    (gs2.user_id IS NOT NULL AND gs2.user_id = gs.user_id)
                    OR (gs2.user_id IS NULL AND gs2.visitor_name = gs.visitor_name)
                )
                ORDER BY gs2.score DESC, gs2.created_at ASC
                LIMIT 1
            )
            ORDER BY gs.score DESC, gs.created_at ASC
            LIMIT 10
            """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("gameId", game.getId());

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        List<LeaderboardEntry> leaderboard = new ArrayList<>();
        int rank = 1;

        for (Object[] row : results) {
            LeaderboardEntry entry = new LeaderboardEntry();
            entry.setId((String) row[0]);
            entry.setRank(rank++);
            entry.setScore((Integer) row[4]);
            entry.setWpm((Integer) row[5]);
            entry.setAccuracy((Double) row[6]);

            // Convertir Timestamp en LocalDateTime
            if (row[7] != null) {
                entry.setCreatedAt(((java.sql.Timestamp) row[7]).toLocalDateTime());
            }

            entry.setUserId((String) row[2]);
            entry.setVisitorName((String) row[3]);

            // Si c'est un utilisateur authentifié
            if (row[2] != null) {
                LeaderboardUser user = new LeaderboardUser();
                user.setFirstName((String) row[8]);
                user.setLastName((String) row[9]);
                user.setEmail((String) row[10]);
                entry.setUser(user);
            }

            leaderboard.add(entry);
        }

        return leaderboard;
    }

    /**
     * Soumettre un score
     * Référence: game.controller.js:104-184
     */
    @Transactional
    public SubmitScoreResponse submitScore(String slug, SubmitScoreRequest request, String userId) {
        // Valider le score
        if (request.getScore() == null || request.getScore() < 0) {
            throw new BadRequestException("Invalid score");
        }

        // Récupérer le jeu
        Game game = gameRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }

        // Vérifier que l'utilisateur existe
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Créer le score
        GameScore gameScore = new GameScore();
        gameScore.setGameId(game.getId());
        gameScore.setUserId(userId);
        gameScore.setScore(request.getScore());
        gameScore.setWpm(request.getWpm());
        gameScore.setAccuracy(request.getAccuracy());

        if (request.getMetadata() != null) {
            // Convert metadata to JSON string if needed
            gameScore.setMetadata(request.getMetadata().toString());
        }

        gameScore = gameScoreRepository.save(gameScore);

        // Récupérer le meilleur score de l'utilisateur
        Optional<GameScore> userBestScoreOpt = gameScoreRepository
                .findFirstByGameIdAndUserIdOrderByScoreDesc(game.getId(), userId);

        Integer bestScore = userBestScoreOpt.map(GameScore::getScore).orElse(0);
        boolean isNewPersonalBest = request.getScore().equals(bestScore);

        // Compter combien de joueurs ont un meilleur score
        String countSql = """
            SELECT COUNT(DISTINCT COALESCE(user_id, visitor_name)) as count
            FROM game_score
            WHERE game_id = :gameId
            AND score > :bestScore
            """;

        Query countQuery = entityManager.createNativeQuery(countSql);
        countQuery.setParameter("gameId", game.getId());
        countQuery.setParameter("bestScore", bestScore);

        Object result = countQuery.getSingleResult();
        long count = result instanceof BigInteger ? ((BigInteger) result).longValue() : ((Number) result).longValue();
        int rank = (int) count + 1;

        // Build response
        SubmitScoreResponse response = new SubmitScoreResponse();
        response.setId(gameScore.getId());
        response.setGameId(gameScore.getGameId());
        response.setUserId(gameScore.getUserId());
        response.setScore(gameScore.getScore());
        response.setWpm(gameScore.getWpm());
        response.setAccuracy(gameScore.getAccuracy());
        response.setMetadata(gameScore.getMetadata());
        response.setCreatedAt(gameScore.getCreatedAt());
        response.setRank(rank);
        response.setNewPersonalBest(isNewPersonalBest);

        // Add user info
        LeaderboardUser userInfo = new LeaderboardUser();
        userInfo.setFirstName(user.getFirstName());
        userInfo.setLastName(user.getLastName());
        userInfo.setEmail(user.getEmail());
        response.setUser(userInfo);

        log.info("Score submitted for game {} by user {}: {} (rank: {})", slug, userId, request.getScore(), rank);

        return response;
    }

    /**
     * Récupérer mes scores
     * Référence: game.controller.js:186-230
     */
    @Transactional(readOnly = true)
    public MyScoresResponse getMyScores(String slug, String userId) {
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }

        Game game = gameRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        // Récupérer les 10 derniers scores
        List<GameScore> scores = gameScoreRepository
                .findTop10ByGameIdAndUserIdOrderByCreatedAtDesc(game.getId(), userId);

        // Récupérer le meilleur score
        Optional<GameScore> bestScoreOpt = gameScoreRepository
                .findFirstByGameIdAndUserIdOrderByScoreDesc(game.getId(), userId);

        int bestScore = bestScoreOpt.map(GameScore::getScore).orElse(0);
        int gamesPlayed = scores.size();

        MyScoresResponse response = new MyScoresResponse();
        response.setScores(scores);
        response.setBestScore(bestScore);
        response.setGamesPlayed(gamesPlayed);

        return response;
    }

    /**
     * Initialiser les jeux par défaut
     * Référence: game.controller.js:232-281
     */
    @Transactional
    public List<Game> initGames() {
        List<GameInitData> gamesData = Arrays.asList(
                new GameInitData("typing-fr", "Typing Challenge FR",
                        "Tapez un maximum de mots en français en 60 secondes !", "keyboard"),
                new GameInitData("typing-en", "Typing Challenge EN",
                        "Type as many English words as you can in 60 seconds!", "keyboard"),
                new GameInitData("memory-game", "Memory Game",
                        "Trouvez toutes les paires de cartes le plus vite possible !", "psychology"),
                new GameInitData("math-rush", "Math Rush",
                        "Résolvez un maximum de calculs en 60 secondes !", "calculate"),
                new GameInitData("flappy-dsi", "Flappy DSI",
                        "Évitez les obstacles de la DSI et battez vos collègues !", "flight")
        );

        for (GameInitData data : gamesData) {
            Optional<Game> existingGame = gameRepository.findBySlug(data.slug());

            if (existingGame.isPresent()) {
                // Update
                Game game = existingGame.get();
                game.setName(data.name());
                game.setDescription(data.description());
                game.setIcon(data.icon());
                gameRepository.save(game);
            } else {
                // Create
                Game game = new Game();
                game.setSlug(data.slug());
                game.setName(data.name());
                game.setDescription(data.description());
                game.setIcon(data.icon());
                game.setIsActive(true);
                gameRepository.save(game);
            }
        }

        log.info("Initialized {} games", gamesData.size());

        return gameRepository.findAll();
    }

    /**
         * Inner class for game initialization data
         */
        private record GameInitData(String slug, String name, String description, String icon) {
    }
}
