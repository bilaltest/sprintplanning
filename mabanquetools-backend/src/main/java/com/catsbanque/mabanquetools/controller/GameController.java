package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.LeaderboardEntry;
import com.catsbanque.mabanquetools.dto.MyScoresResponse;
import com.catsbanque.mabanquetools.dto.SubmitScoreRequest;
import com.catsbanque.mabanquetools.dto.SubmitScoreResponse;
import com.catsbanque.mabanquetools.entity.Game;
import com.catsbanque.mabanquetools.service.GameService;
import com.catsbanque.mabanquetools.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

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
    private final JwtUtil jwtUtil;

    /**
     * GET /api/games
     * Récupérer tous les jeux actifs
     * Référence: game.controller.js:5-16
     */
    @GetMapping
    @PreAuthorize("@permissionService.hasReadAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).PLAYGROUND)")
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
    @PreAuthorize("@permissionService.hasReadAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).PLAYGROUND)")
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
    @PreAuthorize("@permissionService.hasReadAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).PLAYGROUND)")
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
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).PLAYGROUND)")
    public ResponseEntity<SubmitScoreResponse> submitScore(
            @PathVariable String slug,
            @RequestBody SubmitScoreRequest request,
            HttpServletRequest httpRequest) {
        log.info("POST /api/games/{}/scores", slug);

        // Extract userId from JWT token
        String userId = extractUserIdFromJwt(httpRequest);

        SubmitScoreResponse response = gameService.submitScore(slug, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/games/:slug/my-scores
     * Récupérer mes scores
     * Référence: game.controller.js:186-230
     */
    @GetMapping("/{slug}/my-scores")
    @PreAuthorize("@permissionService.hasReadAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).PLAYGROUND)")
    public ResponseEntity<MyScoresResponse> getMyScores(
            @PathVariable String slug,
            HttpServletRequest httpRequest) {
        log.info("GET /api/games/{}/my-scores", slug);

        // Extract userId from JWT token
        String userId = extractUserIdFromJwt(httpRequest);

        MyScoresResponse response = gameService.getMyScores(slug, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/games/init
     * Initialiser les jeux par défaut (admin)
     * Référence: game.controller.js:232-281
     */
    @PostMapping("/init")
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).PLAYGROUND)")
    public ResponseEntity<List<Game>> initGames() {
        log.info("POST /api/games/init");
        List<Game> games = gameService.initGames();
        return ResponseEntity.ok(games);
    }

    /**
     * Helper method to extract userId from JWT token in Authorization header
     */
    private String extractUserIdFromJwt(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            return jwtUtil.extractUserId(token);
        }
        return null;
    }
}
