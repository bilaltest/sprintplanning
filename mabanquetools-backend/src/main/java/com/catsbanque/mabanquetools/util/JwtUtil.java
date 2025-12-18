package com.catsbanque.mabanquetools.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

/**
 * Utilitaire pour générer et valider des tokens JWT.
 *
 * Les tokens JWT contiennent:
 * - Subject: userId
 * - Claims custom: email, firstName, lastName
 * - Expiration: 24 heures par défaut
 */
@Component
@Slf4j
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationDays;

    public JwtUtil(
            @Value("${jwt.secret:Ma_Banque_Tools_JWT_Secret_Key_2024_Minimum_256_Bits_For_HS256_Algorithm}") String secret,
            @Value("${jwt.expiration:30}") long expirationDays // 30 jours
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationDays = expirationDays;
    }

    /**
     * Génère un token JWT pour un utilisateur.
     *
     * @param userId l'ID de l'utilisateur
     * @param email l'email de l'utilisateur
     * @param firstName le prénom
     * @param lastName le nom
     * @return le token JWT signé
     */
    public String generateToken(String userId, String email, String firstName, String lastName) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (expirationDays * (86400 * 1000)));

        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("firstName", firstName)
                .claim("lastName", lastName)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Valide un token JWT et retourne les claims.
     *
     * @param token le token JWT
     * @return les claims du token
     * @throws JwtException si le token est invalide ou expiré
     */
    public Claims validateToken(String token) throws JwtException {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.warn("Token expiré: {}", e.getMessage());
            throw e;
        } catch (MalformedJwtException e) {
            log.warn("Token JWT malformé: {}", e.getMessage());
            throw e;
        } catch (JwtException e) {
            log.warn("Token JWT invalide: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Extrait l'userId du token JWT.
     *
     * @param token le token JWT
     * @return l'userId ou null si invalide
     */
    public String extractUserId(String token) {
        try {
            Claims claims = validateToken(token);
            return claims.getSubject();
        } catch (JwtException e) {
            log.error("Erreur lors de l'extraction de l'userId depuis le token JWT: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extrait l'email du token JWT.
     *
     * @param token le token JWT
     * @return l'email ou null si invalide
     */
    public String extractEmail(String token) {
        try {
            Claims claims = validateToken(token);
            return claims.get("email", String.class);
        } catch (JwtException e) {
            log.error("Erreur lors de l'extraction de l'email depuis le token JWT: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extrait tous les claims custom du token.
     *
     * @param token le token JWT
     * @return Map des claims ou null si invalide
     */
    public Map<String, Object> extractAllClaims(String token) {
        try {
            Claims claims = validateToken(token);
            return Map.of(
                    "userId", claims.getSubject(),
                    "email", claims.get("email", String.class),
                    "firstName", claims.get("firstName", String.class),
                    "lastName", claims.get("lastName", String.class),
                    "issuedAt", claims.getIssuedAt(),
                    "expiration", claims.getExpiration()
            );
        } catch (JwtException e) {
            log.error("Erreur lors de l'extraction des claims depuis le token JWT: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Vérifie si un token JWT est expiré.
     *
     * @param token le token JWT
     * @return true si expiré, false sinon
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = validateToken(token);
            return claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (JwtException e) {
            log.error("Erreur lors de la vérification de l'expiration du token: {}", e.getMessage());
            return true; // Par sécurité, considérer comme expiré en cas d'erreur
        }
    }
}
