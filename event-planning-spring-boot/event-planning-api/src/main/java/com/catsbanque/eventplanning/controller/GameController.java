package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.dto.*;
import com.catsbanque.eventplanning.entity.Game;
import com.catsbanque.eventplanning.service.GameService;
import com.catsbanque.eventplanning.util.TokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour les jeux
 * Endpoints identiques à Node.js (game.routes.js)
 */
@Slf4j
@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    /**
     * GET /api/games
     * Récupérer tous les jeux actifs
     * Référence: game.controller.js:5-16
     */
    @GetMapping
    public ResponseEntity<List<Game>> getAllGames() {
        log.info("GET /api/games");
        List<Game> games = gameService.getAllGames();
        return ResponseEntity.ok(games);
    }

    /**
     * GET /api/games/:slug
     * Récupérer un jeu par slug
     * Référence: game.controller.js:18-35
     */
    @GetMapping("/{slug}")
    public ResponseEntity<Game> getGameBySlug(@PathVariable String slug) {
        log.info("GET /api/games/{}", slug);
        Game game = gameService.getGameBySlug(slug);
        return ResponseEntity.ok(game);
    }

    /**
     * GET /api/games/:slug/leaderboard
     * Récupérer le classement Top 10
     * Référence: game.controller.js:37-102
     */
    @GetMapping("/{slug}/leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(@PathVariable String slug) {
        log.info("GET /api/games/{}/leaderboard", slug);
        List<LeaderboardEntry> leaderboard = gameService.getLeaderboard(slug);
        return ResponseEntity.ok(leaderboard);
    }

    /**
     * POST /api/games/:slug/scores
     * Soumettre un score
     * Référence: game.controller.js:104-184
     */
    @PostMapping("/{slug}/scores")
    public ResponseEntity<SubmitScoreResponse> submitScore(
            @PathVariable String slug,
            @RequestBody SubmitScoreRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("POST /api/games/{}/scores", slug);

        // Extract userId from token
        String userId = TokenUtil.extractUserIdFromRequest(httpRequest).orElse(null);

        SubmitScoreResponse response = gameService.submitScore(slug, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/games/:slug/my-scores
     * Récupérer mes scores
     * Référence: game.controller.js:186-230
     */
    @GetMapping("/{slug}/my-scores")
    public ResponseEntity<MyScoresResponse> getMyScores(
            @PathVariable String slug,
            HttpServletRequest httpRequest
    ) {
        log.info("GET /api/games/{}/my-scores", slug);

        // Extract userId from token
        String userId = TokenUtil.extractUserIdFromRequest(httpRequest).orElse(null);

        MyScoresResponse response = gameService.getMyScores(slug, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/games/init
     * Initialiser les jeux par défaut (admin)
     * Référence: game.controller.js:232-281
     */
    @PostMapping("/init")
    public ResponseEntity<List<Game>> initGames() {
        log.info("POST /api/games/init");
        List<Game> games = gameService.initGames();
        return ResponseEntity.ok(games);
    }
}
