package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.dto.AuthResponse;
import com.catsbanque.eventplanning.dto.CurrentUserResponse;
import com.catsbanque.eventplanning.dto.LoginRequest;
import com.catsbanque.eventplanning.dto.RegisterRequest;
import com.catsbanque.eventplanning.dto.UserDto;
import com.catsbanque.eventplanning.exception.UnauthorizedException;
import com.catsbanque.eventplanning.service.AuthService;
import com.catsbanque.eventplanning.util.TokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur d'authentification
 * Endpoints identiques à Node.js (routes/auth.routes.js)
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Enregistrement d'un nouvel utilisateur
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /api/auth/register - Email: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     * Connexion d'un utilisateur
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /api/auth/login - Email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/me
     * Récupère l'utilisateur courant
     * Référence: auth.controller.js:185-213
     */
    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> getCurrentUser(HttpServletRequest request) {
        log.info("GET /api/auth/me");

        // Extraire userId depuis le token (auth.controller.js:188-192)
        String userId = TokenUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new UnauthorizedException("Non authentifié"));

        // Récupérer l'utilisateur
        UserDto user = authService.getCurrentUser(userId);

        // Retourner format { user: UserDto } (auth.controller.js:206)
        CurrentUserResponse response = CurrentUserResponse.builder()
                .user(user)
                .build();

        return ResponseEntity.ok(response);
    }
}
