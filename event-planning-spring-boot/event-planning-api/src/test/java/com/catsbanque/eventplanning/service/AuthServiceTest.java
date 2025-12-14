package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.AuthResponse;
import com.catsbanque.eventplanning.dto.LoginRequest;
import com.catsbanque.eventplanning.dto.RegisterRequest;
import com.catsbanque.eventplanning.entity.User;
import com.catsbanque.eventplanning.exception.BadRequestException;
import com.catsbanque.eventplanning.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService - Tests unitaires")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PermissionService permissionService;

    @Mock
    private com.catsbanque.eventplanning.util.JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        // Setup commun si nécessaire
    }

    @Test
    @DisplayName("Register - Email valide @ca-ts.fr")
    void testRegister_ValidEmail() {
        // Given
        RegisterRequest request = new RegisterRequest("jean.dupont@ca-ts.fr", "Password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.count()).thenReturn(50L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("test-user-id");
            return user;
        });
        when(jwtUtil.generateToken(anyString(), anyString(), anyString(), anyString())).thenReturn("eyJtest.token.jwt");

        // When
        AuthResponse response = authService.register(request);

        // Then
        assertNotNull(response);
        assertEquals("Compte créé avec succès", response.getMessage());
        assertNotNull(response.getUser());
        assertEquals("jean.dupont@ca-ts.fr", response.getUser().getEmail());
        assertEquals("Jean", response.getUser().getFirstName());
        assertEquals("DUPONT", response.getUser().getLastName());

        verify(userRepository).save(argThat(user ->
                user.getFirstName().equals("Jean") &&
                        user.getLastName().equals("DUPONT")
        ));
    }

    @Test
    @DisplayName("Register - Email avec extension -ext")
    void testRegister_EmailWithExt() {
        // Given
        RegisterRequest request = new RegisterRequest("marie.martin-ext@ca-ts.fr", "Password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.count()).thenReturn(50L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("test-user-id");
            return user;
        });
        when(jwtUtil.generateToken(anyString(), anyString(), anyString(), anyString())).thenReturn("eyJtest.token.jwt");

        // When
        AuthResponse response = authService.register(request);

        // Then
        assertNotNull(response);
        assertEquals("Marie", response.getUser().getFirstName());
        assertEquals("MARTIN", response.getUser().getLastName());
    }

    @Test
    @DisplayName("Register - Email invalide (non @ca-ts.fr)")
    void testRegister_InvalidEmail() {
        // Given
        RegisterRequest request = new RegisterRequest("invalid@gmail.com", "Password123");

        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });

        assertTrue(exception.getMessage().contains("prenom.nom@ca-ts.fr"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Register - Mot de passe trop court")
    void testRegister_WeakPassword() {
        // Given
        RegisterRequest request = new RegisterRequest("pierre.martin@ca-ts.fr", "abc");

        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });

        assertTrue(exception.getMessage().contains("8 caractères"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Register - Mot de passe sans chiffre")
    void testRegister_PasswordNoNumber() {
        // Given
        RegisterRequest request = new RegisterRequest("sophie.bernard@ca-ts.fr", "PasswordOnly");

        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });

        assertTrue(exception.getMessage().contains("lettre") && exception.getMessage().contains("chiffre"));
    }

    @Test
    @DisplayName("Register - Mot de passe avec caractères spéciaux")
    void testRegister_PasswordSpecialChars() {
        // Given
        RegisterRequest request = new RegisterRequest("lucas.petit@ca-ts.fr", "Pass@word123");

        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });

        assertTrue(exception.getMessage().contains("alphanumérique"));
    }

    @Test
    @DisplayName("Register - Email déjà existant")
    void testRegister_EmailAlreadyExists() {
        // Given
        RegisterRequest request = new RegisterRequest("emma.dubois@ca-ts.fr", "Password123");
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });

        assertTrue(exception.getMessage().contains("existe"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Register - Limite 200 utilisateurs atteinte")
    void testRegister_MaxUsersReached() {
        // Given
        RegisterRequest request = new RegisterRequest("thomas.robert@ca-ts.fr", "Password123");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.count()).thenReturn(200L);

        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });

        assertTrue(exception.getMessage().contains("200") || exception.getMessage().contains("Limite"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Register - Email admin")
    void testRegister_AdminEmail() {
        // Given
        RegisterRequest request = new RegisterRequest("admin", "Password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.count()).thenReturn(50L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("admin-id");
            return user;
        });
        when(jwtUtil.generateToken(anyString(), anyString(), anyString(), anyString())).thenReturn("eyJtest.token.jwt");

        // When
        AuthResponse response = authService.register(request);

        // Then
        assertNotNull(response);
        assertEquals("Admin", response.getUser().getFirstName());
        assertEquals("System", response.getUser().getLastName());
    }

    @Test
    @DisplayName("Login - Succès")
    void testLogin_Success() {
        // Given
        LoginRequest request = new LoginRequest("jean.dupont@ca-ts.fr", "Password123");

        User user = new User();
        user.setId("user-123");
        user.setEmail("jean.dupont@ca-ts.fr");
        user.setPassword("hashedPassword");
        user.setFirstName("Jean");
        user.setLastName("DUPONT");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(permissionService.getUserPermissions(anyString())).thenReturn(java.util.Map.of());
        when(jwtUtil.generateToken(anyString(), anyString(), anyString(), anyString())).thenReturn("eyJtest.token.jwt");

        // When
        AuthResponse response = authService.login(request);

        // Then
        assertNotNull(response);
        assertEquals("Connexion réussie", response.getMessage());
        assertNotNull(response.getToken());
        assertTrue(response.getToken().startsWith("eyJ")); // JWT starts with eyJ
        assertEquals("jean.dupont@ca-ts.fr", response.getUser().getEmail());
    }

    @Test
    @DisplayName("Login - Email inexistant")
    void testLogin_EmailNotFound() {
        // Given
        LoginRequest request = new LoginRequest("inconnu@ca-ts.fr", "Password123");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.login(request);
        });

        assertTrue(exception.getMessage().contains("Email ou mot de passe incorrect"));
    }

    @Test
    @DisplayName("Login - Mauvais mot de passe")
    void testLogin_WrongPassword() {
        // Given
        LoginRequest request = new LoginRequest("claire.leroy@ca-ts.fr", "WrongPassword123");

        User user = new User();
        user.setPassword("hashedPassword");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.login(request);
        });

        assertTrue(exception.getMessage().contains("Email ou mot de passe incorrect"));
    }

    @Test
    @DisplayName("Login - Email null")
    void testLogin_NullEmail() {
        // Given
        LoginRequest request = new LoginRequest(null, "Password123");

        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.login(request);
        });

        assertTrue(exception.getMessage().contains("requis"));
    }
}
