package com.catsbanque.mabanquetools.util;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@DisplayName("TokenUtil - Tests unitaires")
class TokenUtilTest {

    @Test
    @DisplayName("extractToken - Avec Bearer token valide")
    void testExtractToken_ValidBearerToken() {
        // Given
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        when(request.getHeader("Authorization")).thenReturn("Bearer token_user123_1234567890");

        // When
        Optional<String> token = TokenUtil.extractToken(request);

        // Then
        assertTrue(token.isPresent());
        assertEquals("token_user123_1234567890", token.get());
    }

    @Test
    @DisplayName("extractToken - Sans Authorization header")
    void testExtractToken_NoHeader() {
        // Given
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        when(request.getHeader("Authorization")).thenReturn(null);

        // When
        Optional<String> token = TokenUtil.extractToken(request);

        // Then
        assertFalse(token.isPresent());
    }

    @Test
    @DisplayName("extractToken - Sans Bearer prefix")
    void testExtractToken_NoBearerPrefix() {
        // Given
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        when(request.getHeader("Authorization")).thenReturn("token_user123_1234567890");

        // When
        Optional<String> token = TokenUtil.extractToken(request);

        // Then
        assertFalse(token.isPresent());
    }

    @Test
    @DisplayName("extractUserId - Token valide")
    void testExtractUserId_ValidToken() {
        // Given
        String token = "token_user123_1234567890";

        // When
        Optional<String> userId = TokenUtil.extractUserId(token);

        // Then
        assertTrue(userId.isPresent());
        assertEquals("user123", userId.get());
    }

    @Test
    @DisplayName("extractUserId - Token avec CUID")
    void testExtractUserId_CuidFormat() {
        // Given
        String token = "token_clh5k3z9p0000ld08a1234567_1701234567890";

        // When
        Optional<String> userId = TokenUtil.extractUserId(token);

        // Then
        assertTrue(userId.isPresent());
        assertEquals("clh5k3z9p0000ld08a1234567", userId.get());
    }

    @Test
    @DisplayName("extractUserId - Token null")
    void testExtractUserId_NullToken() {
        // When
        Optional<String> userId = TokenUtil.extractUserId(null);

        // Then
        assertFalse(userId.isPresent());
    }

    @Test
    @DisplayName("extractUserId - Token vide")
    void testExtractUserId_EmptyToken() {
        // When
        Optional<String> userId = TokenUtil.extractUserId("");

        // Then
        assertFalse(userId.isPresent());
    }

    @Test
    @DisplayName("extractUserId - Token sans prefix token_")
    void testExtractUserId_InvalidPrefix() {
        // Given
        String token = "invalid_user123_1234567890";

        // When
        Optional<String> userId = TokenUtil.extractUserId(token);

        // Then
        assertFalse(userId.isPresent());
    }

    @Test
    @DisplayName("extractUserId - Token format invalide (pas assez de parties)")
    void testExtractUserId_InvalidFormat() {
        // Given
        String token = "token_user123"; // Manque le timestamp

        // When
        Optional<String> userId = TokenUtil.extractUserId(token);

        // Then
        assertFalse(userId.isPresent());
    }

    @Test
    @DisplayName("extractUserIdFromRequest - Succès complet")
    void testExtractUserIdFromRequest_Success() {
        // Given
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        when(request.getHeader("Authorization")).thenReturn("Bearer token_user123_1234567890");

        // When
        Optional<String> userId = TokenUtil.extractUserIdFromRequest(request);

        // Then
        assertTrue(userId.isPresent());
        assertEquals("user123", userId.get());
    }

    @Test
    @DisplayName("extractUserIdFromRequest - Sans header")
    void testExtractUserIdFromRequest_NoHeader() {
        // Given
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        when(request.getHeader("Authorization")).thenReturn(null);

        // When
        Optional<String> userId = TokenUtil.extractUserIdFromRequest(request);

        // Then
        assertFalse(userId.isPresent());
    }

    @Test
    @DisplayName("generateToken - Format correct")
    void testGenerateToken() {
        // Given
        String userId = "user123";

        // When
        String token = TokenUtil.generateToken(userId);

        // Then
        assertNotNull(token);
        assertTrue(token.startsWith("token_user123_"));

        // Vérifier qu'on peut extraire l'userId
        Optional<String> extractedUserId = TokenUtil.extractUserId(token);
        assertTrue(extractedUserId.isPresent());
        assertEquals(userId, extractedUserId.get());
    }

    @Test
    @DisplayName("generateToken - Tokens uniques")
    void testGenerateToken_Uniqueness() throws InterruptedException {
        // Given
        String userId = "user123";

        // When
        String token1 = TokenUtil.generateToken(userId);
        Thread.sleep(1); // Attendre 1ms pour avoir un timestamp différent
        String token2 = TokenUtil.generateToken(userId);

        // Then
        assertNotEquals(token1, token2); // Les tokens doivent être différents
    }
}
