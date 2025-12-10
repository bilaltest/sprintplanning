package com.catsbanque.eventplanning.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

/**
 * Utilitaire pour extraire et parser les tokens d'authentification
 * Format du token: token_<userId>_<timestamp>
 */
@Slf4j
public class TokenUtil {

    private static final String TOKEN_HEADER = "Authorization";
    private static final String TOKEN_PREFIX = "Bearer ";

    /**
     * Extrait le token depuis le header Authorization
     *
     * @param request la requête HTTP
     * @return le token ou empty si absent
     */
    public static Optional<String> extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader(TOKEN_HEADER);

        if (authHeader != null && authHeader.startsWith(TOKEN_PREFIX)) {
            return Optional.of(authHeader.substring(TOKEN_PREFIX.length()));
        }

        return Optional.empty();
    }

    /**
     * Extrait l'ID utilisateur depuis le token
     * Format du token: token_<userId>_<timestamp>
     *
     * @param token le token
     * @return l'ID utilisateur ou empty si invalide
     */
    public static Optional<String> extractUserId(String token) {
        if (token == null || token.isEmpty()) {
            return Optional.empty();
        }

        try {
            // Format: token_<userId>_<timestamp>
            if (!token.startsWith("token_")) {
                log.warn("Token invalide: ne commence pas par 'token_'");
                return Optional.empty();
            }

            String[] parts = token.split("_");
            if (parts.length != 3) {
                log.warn("Token invalide: format incorrect");
                return Optional.empty();
            }

            String userId = parts[1];
            return Optional.of(userId);

        } catch (Exception e) {
            log.error("Erreur lors de l'extraction de l'userId depuis le token", e);
            return Optional.empty();
        }
    }

    /**
     * Extrait l'ID utilisateur directement depuis la requête
     *
     * @param request la requête HTTP
     * @return l'ID utilisateur ou empty si absent/invalide
     */
    public static Optional<String> extractUserIdFromRequest(HttpServletRequest request) {
        return extractToken(request)
                .flatMap(TokenUtil::extractUserId);
    }

    /**
     * Génère un nouveau token pour un utilisateur
     *
     * @param userId l'ID de l'utilisateur
     * @return le token généré
     */
    public static String generateToken(String userId) {
        return String.format("token_%s_%d", userId, System.currentTimeMillis());
    }
}
