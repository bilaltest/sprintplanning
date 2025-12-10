package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.AuthResponse;
import com.catsbanque.eventplanning.dto.LoginRequest;
import com.catsbanque.eventplanning.dto.RegisterRequest;
import com.catsbanque.eventplanning.dto.UserDto;
import com.catsbanque.eventplanning.entity.User;
import com.catsbanque.eventplanning.exception.BadRequestException;
import com.catsbanque.eventplanning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
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

    // Pattern email: prenom.nom@ca-ts.fr ou prenom.nom-ext@ca-ts.fr
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-z]+\\.[a-z]+(-ext)?@ca-ts\\.fr$", Pattern.CASE_INSENSITIVE);

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
                    "L'adresse email doit être au format prenom.nom@ca-ts.fr ou prenom.nom-ext@ca-ts.fr"
            );
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
                    "Limite d'utilisateurs atteinte (200 max). Veuillez contacter l'administrateur."
            );
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

        return AuthResponse.builder()
                .message("Compte créé avec succès")
                .user(UserDto.fromEntity(saved))
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

        // Générer token simple (auth.controller.js:177)
        String token = String.format("token_%s_%d", user.getId(), System.currentTimeMillis());

        log.info("Connexion réussie pour: {}", email);

        return AuthResponse.builder()
                .message("Connexion réussie")
                .token(token)
                .user(UserDto.fromEntity(user))
                .build();
    }

    /**
     * Récupère l'utilisateur courant
     * Référence: auth.controller.js:185-213
     */
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String userId) {
        log.info("Récupération de l'utilisateur: {}", userId);

        // Trouver utilisateur (auth.controller.js:197-199)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.catsbanque.eventplanning.exception.ResourceNotFoundException(
                        "Utilisateur non trouvé"
                ));

        // Retourner sans le mot de passe (auth.controller.js:202-203)
        return UserDto.fromEntity(user);
    }

    /**
     * Validation du mot de passe
     * Référence: auth.controller.js:44-78
     */
    private void validatePassword(String password) {
        if (password.length() < 8) {
            throw new BadRequestException("Le mot de passe doit contenir au moins 8 caractères");
        }

        boolean hasLetter = password.matches(".*[a-zA-Z].*");
        boolean hasNumber = password.matches(".*[0-9].*");
        boolean isAlphanumeric = password.matches("^[a-zA-Z0-9]+$");

        if (!isAlphanumeric) {
            throw new BadRequestException(
                    "Le mot de passe doit être alphanumérique (lettres et chiffres uniquement)"
            );
        }

        if (!hasLetter || !hasNumber) {
            throw new BadRequestException(
                    "Le mot de passe doit contenir au moins une lettre et un chiffre"
            );
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
     * Record pour stocker le prénom et nom
     */
    private record NamePair(String firstName, String lastName) {
    }
}
