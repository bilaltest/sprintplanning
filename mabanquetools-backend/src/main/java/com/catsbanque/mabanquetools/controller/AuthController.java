package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.AuthResponse;
import com.catsbanque.mabanquetools.dto.CurrentUserResponse;
import com.catsbanque.mabanquetools.dto.LoginRequest;
import com.catsbanque.mabanquetools.dto.RegisterRequest;
import com.catsbanque.mabanquetools.dto.UpdatePreferencesRequest;
import com.catsbanque.mabanquetools.dto.UpdatePreferencesResponse;
import com.catsbanque.mabanquetools.dto.UpdateWidgetOrderRequest;
import com.catsbanque.mabanquetools.dto.UserDto;
import com.catsbanque.mabanquetools.exception.BadRequestException;
import com.catsbanque.mabanquetools.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
     * Utilise l'Authentication définie par JwtAuthenticationFilter
     */
    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> getCurrentUser(Authentication authentication) {
        log.info("GET /api/auth/me");

        // L'userId est déjà extrait du JWT par JwtAuthenticationFilter et stocké dans
        // Authentication.principal
        String userId = (String) authentication.getPrincipal();

        // Récupérer l'utilisateur avec ses permissions
        UserDto user = authService.getCurrentUser(userId);

        // Retourner format { user: UserDto }
        CurrentUserResponse response = CurrentUserResponse.builder()
                .user(user)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/auth/preferences
     * Met à jour les préférences de l'utilisateur (thème)
     * Référence: auth.controller.js:247-282
     */
    @PutMapping("/preferences")
    public ResponseEntity<UpdatePreferencesResponse> updatePreferences(
            @Valid @RequestBody UpdatePreferencesRequest request,
            Authentication authentication) {
        log.info("PUT /api/auth/preferences - theme: {}", request.getThemePreference());

        // L'userId est déjà extrait du JWT par JwtAuthenticationFilter
        String userId = (String) authentication.getPrincipal();

        // Validation supplémentaire (auth.controller.js:258-260)
        String theme = request.getThemePreference();
        if (theme != null && !theme.equals("light") && !theme.equals("dark")) {
            throw new BadRequestException("Le thème doit être \"light\" ou \"dark\"");
        }

        // Mettre à jour les préférences
        UserDto user = authService.updatePreferences(userId, theme);

        // Retourner format identique à Node.js (auth.controller.js:273-276)
        UpdatePreferencesResponse response = UpdatePreferencesResponse.builder()
                .message("Préférences mises à jour")
                .user(user)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/auth/widget-order
     * Met à jour l'ordre des widgets sur la home pour l'utilisateur
     * Référence: auth.controller.js:288-329
     */
    @PutMapping("/widget-order")
    public ResponseEntity<UpdatePreferencesResponse> updateWidgetOrder(
            @Valid @RequestBody UpdateWidgetOrderRequest request,
            Authentication authentication) {
        log.info("PUT /api/auth/widget-order - widgets: {}", request.getWidgetOrder());

        // L'userId est déjà extrait du JWT par JwtAuthenticationFilter
        String userId = (String) authentication.getPrincipal();

        // Validation supplémentaire (auth.controller.js:299-307)
        if (request.getWidgetOrder() == null || request.getWidgetOrder().isEmpty()) {
            throw new BadRequestException("widgetOrder ne peut pas être vide");
        }

        // Mettre à jour l'ordre des widgets
        UserDto user = authService.updateWidgetOrder(userId, request.getWidgetOrder());

        // Retourner format identique à Node.js (auth.controller.js:320-323)
        UpdatePreferencesResponse response = UpdatePreferencesResponse.builder()
                .message("Ordre des widgets mis à jour")
                .user(user)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/change-password
     * Permet à l'utilisateur de changer son mot de passe
     */
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody com.catsbanque.mabanquetools.dto.ChangePasswordRequest request,
            Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        log.info("POST /api/auth/change-password - User: {}", userId);

        authService.changePassword(userId, request.getNewPassword());

        return ResponseEntity.ok().build();
    }
}
