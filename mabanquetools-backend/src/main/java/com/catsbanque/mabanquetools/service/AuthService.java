package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.AuthResponse;
import com.catsbanque.mabanquetools.dto.LoginRequest;
import com.catsbanque.mabanquetools.dto.RegisterRequest;
import com.catsbanque.mabanquetools.dto.UserDto;
import com.catsbanque.mabanquetools.entity.PermissionLevel;
import com.catsbanque.mabanquetools.entity.PermissionModule;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.exception.BadRequestException;
import com.catsbanque.mabanquetools.repository.UserRepository;
import com.catsbanque.mabanquetools.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;

import java.util.Arrays;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service d'authentification identique à Node.js (auth.controller.js)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PermissionService permissionService;

    // Pattern email: prenom.nom@ca-ts.fr ou prenom.nom-ext@ca-ts.fr
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-z]+\\.[a-z]+(-ext)?@ca-ts\\.fr$",
            Pattern.CASE_INSENSITIVE);

    private static final int MAX_USERS = 200;

    /**
     * Enregistrement d'un nouvel utilisateur
     * Référence: auth.controller.js:84-146
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase();
        String password = request.getPassword();

        log.info("Tentative d'enregistrement pour: {}", email);

        // Validation email (auth.controller.js:89-93)
        if (!"admin".equals(email) && !EMAIL_PATTERN.matcher(email).matches()) {
            throw new BadRequestException(
                    "L'adresse email doit être au format prenom.nom@ca-ts.fr ou prenom.nom-ext@ca-ts.fr");
        }

        // Validation mot de passe (auth.controller.js:96-99)
        validatePassword(password);

        // Vérification existence (auth.controller.js:102-108)
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Un compte existe déjà avec cette adresse email");
        }

        // Limite 200 users (auth.controller.js:111-116)
        long userCount = userRepository.count();
        if (userCount >= MAX_USERS) {
            throw new BadRequestException(
                    "Limite d'utilisateurs atteinte (200 max). Veuillez contacter l'administrateur.");
        }

        // Extraction prénom/nom (auth.controller.js:119)
        NamePair names = extractNameFromEmail(email);

        // Hash password avec BCrypt coût 10 (auth.controller.js:122)
        String hashedPassword = passwordEncoder.encode(password);

        // Créer utilisateur (auth.controller.js:125-132)
        User user = new User();
        user.setEmail(email);
        user.setPassword(hashedPassword);
        user.setFirstName(names.firstName);
        user.setLastName(names.lastName);
        user.setThemePreference("light");
        user.setWidgetOrder("[]");

        User saved = userRepository.save(user);
        log.info("Utilisateur créé avec succès: {}", saved.getId());

        // Créer les permissions par défaut
        permissionService.createDefaultPermissions(saved);

        // Charger les permissions pour la réponse
        Map<PermissionModule, PermissionLevel> permissions = permissionService.getUserPermissions(saved.getId());

        // Générer le token JWT
        String jwtToken = jwtUtil.generateToken(saved.getId(), saved.getEmail(), saved.getFirstName(),
                saved.getLastName());

        return AuthResponse.builder()
                .message("Compte créé avec succès")
                .token(jwtToken)
                .user(UserDto.fromEntityWithPermissions(saved, permissions))
                .build();
    }

    /**
     * Connexion d'un utilisateur
     * Référence: auth.controller.js:151-180
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Validation (auth.controller.js:156-158)
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new BadRequestException("Email et mot de passe requis");
        }

        String email = request.getEmail().toLowerCase();
        String password = request.getPassword();

        log.info("Tentative de connexion pour: {}", email);

        // Trouver utilisateur (auth.controller.js:161-163)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email ou mot de passe incorrect"));

        // Vérifier password (auth.controller.js:170-174)
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Email ou mot de passe incorrect");
        }

        // Charger les permissions de l'utilisateur
        Map<PermissionModule, PermissionLevel> permissions = permissionService.getUserPermissions(user.getId());

        // Générer token JWT
        String jwtToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName());

        log.info("Connexion réussie pour: {}", email);

        return AuthResponse.builder()
                .message("Connexion réussie")
                .token(jwtToken)
                .user(UserDto.fromEntityWithPermissions(user, permissions))
                .build();
    }

    /**
     * Récupère l'utilisateur courant avec ses permissions
     * Référence: auth.controller.js:185-213
     */
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String userId) {
        log.info("Récupération de l'utilisateur: {}", userId);

        // Trouver utilisateur (auth.controller.js:197-199)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.catsbanque.mabanquetools.exception.ResourceNotFoundException(
                        "Utilisateur non trouvé"));

        // Charger les permissions
        Map<PermissionModule, PermissionLevel> permissions = permissionService.getUserPermissions(userId);

        // Retourner sans le mot de passe (auth.controller.js:202-203)
        return UserDto.fromEntityWithPermissions(user, permissions);
    }

    /**
     * Met à jour les préférences utilisateur (thème)
     */
    @Transactional
    public UserDto updatePreferences(String userId, String themePreference) {
        log.info("Mise à jour des préférences pour l'utilisateur {}: theme={}", userId, themePreference);

        // Trouver utilisateur
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.catsbanque.mabanquetools.exception.ResourceNotFoundException(
                        "Utilisateur non trouvé"));

        // Mettre à jour le thème
        user.setThemePreference(themePreference);
        User updated = userRepository.save(user);

        // Charger les permissions
        Map<PermissionModule, PermissionLevel> permissions = permissionService.getUserPermissions(userId);

        // Retourner l'utilisateur mis à jour avec ses permissions
        return UserDto.fromEntityWithPermissions(updated, permissions);
    }

    /**
     * Met à jour l'ordre des widgets sur la home pour l'utilisateur
     * Référence: auth.controller.js:288-329
     */
    @Transactional
    public UserDto updateWidgetOrder(String userId, java.util.List<String> widgetOrder) {
        log.info("Mise à jour de l'ordre des widgets pour l'utilisateur {}: {}", userId, widgetOrder);

        // Trouver utilisateur
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.catsbanque.mabanquetools.exception.ResourceNotFoundException(
                        "Utilisateur non trouvé"));

        // Validation: vérifier que tous les IDs sont des strings
        // (auth.controller.js:304-307)
        if (widgetOrder.stream().anyMatch(id -> !(id instanceof String))) {
            throw new BadRequestException("Les IDs des widgets doivent être des strings");
        }

        // Convertir la liste en JSON string (auth.controller.js:310-315)
        String widgetOrderJson;
        try {
            widgetOrderJson = new tools.jackson.databind.ObjectMapper().writeValueAsString(widgetOrder);
        } catch (JacksonException e) {
            throw new BadRequestException("Erreur lors de la sérialisation de widgetOrder");
        }

        // Mettre à jour l'ordre des widgets
        user.setWidgetOrder(widgetOrderJson);
        User updated = userRepository.save(user);

        // Charger les permissions
        Map<PermissionModule, PermissionLevel> permissions = permissionService.getUserPermissions(userId);

        log.info("Ordre des widgets mis à jour avec succès pour l'utilisateur {}", userId);

        // Retourner l'utilisateur mis à jour avec ses permissions
        // (auth.controller.js:318-323)
        return UserDto.fromEntityWithPermissions(updated, permissions);
    }

    /**
     * Changement de mot de passe utilisateur
     */
    @Transactional
    public void changePassword(String userId, String newPassword) {
        log.info("Changement de mot de passe pour l'utilisateur: {}", userId);

        // Valider le nouveau mot de passe
        validatePassword(newPassword);

        // Trouver utilisateur
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.catsbanque.mabanquetools.exception.ResourceNotFoundException(
                        "Utilisateur non trouvé"));

        if (Boolean.TRUE.equals(user.getCannotChangePassword())) {
            throw new com.catsbanque.mabanquetools.exception.BadRequestException(
                    "Vous ne pouvez pas modifier le mot de passe de cet utilisateur");
        }

        // Mettre à jour le mot de passe
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Validation du mot de passe
     * Référence: auth.controller.js:44-78
     */
    private void validatePassword(String password) {
        if (password == null || password.isEmpty()) {
            throw new BadRequestException("Le mot de passe est requis");
        }

        if (password.length() >= 50) {
            throw new BadRequestException("Le mot de passe ne doit pas dépasser 50 caractères");
        }
    }

    /**
     * Extraction du prénom et nom depuis l'email
     * Référence: auth.controller.js:11-40
     */
    private NamePair extractNameFromEmail(String email) {
        // Cas spécial admin (auth.controller.js:13-17)
        if ("admin".equalsIgnoreCase(email)) {
            return new NamePair("Admin", "System");
        }

        // Extraction prenom.nom (auth.controller.js:20-40)
        String localPart = email.split("@")[0];
        String namePart = localPart.replaceAll("-ext$", "");
        String[] parts = namePart.split("\\.");

        if (parts.length >= 2) {
            String firstName = capitalize(parts[0]);
            String lastName = Arrays.stream(parts, 1, parts.length)
                    .map(String::toUpperCase)
                    .collect(Collectors.joining(" "));
            return new NamePair(firstName, lastName);
        }

        return new NamePair(capitalize(parts[0]), "");
    }

    /**
     * Capitalise la première lettre d'une chaîne
     */
    private String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    /**
     * Débloque l'accès au playground pour l'utilisateur (Easter Egg)
     */
    @Transactional
    public UserDto unlockPlayground(String userId) {
        log.info("Déblocage du playground pour l'utilisateur: {}", userId);

        permissionService.grantPlaygroundAccess(userId);

        // Return updated user with permissions
        return getCurrentUser(userId);
    }

    /**
     * Record pour stocker le prénom et nom
     */
    private record NamePair(String firstName, String lastName) {
    }
}
