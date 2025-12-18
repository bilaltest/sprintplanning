package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.LoginRequest;
import com.catsbanque.mabanquetools.dto.RegisterRequest;
import com.catsbanque.mabanquetools.repository.UserRepository;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("AuthController - Tests d'intégration")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        // Nettoyer la base de données avant chaque test
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("POST /api/auth/register - Succès")
    void testRegister_Success() throws Exception {
        // Given
        RegisterRequest request = new RegisterRequest("jean.dupont@ca-ts.fr", "Password123");

        // When & Then
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Compte créé avec succès"))
                .andExpect(jsonPath("$.user").exists())
                .andExpect(jsonPath("$.user.email").value("jean.dupont@ca-ts.fr"))
                .andExpect(jsonPath("$.user.firstName").value("Jean"))
                .andExpect(jsonPath("$.user.lastName").value("DUPONT"))
                .andExpect(jsonPath("$.user.themePreference").value("light"))
                .andExpect(jsonPath("$.user.password").doesNotExist()); // Password ne doit pas être exposé
    }

    @Test
    @DisplayName("POST /api/auth/register - Email invalide")
    void testRegister_InvalidEmail() throws Exception {
        // Given
        RegisterRequest request = new RegisterRequest("invalid@gmail.com", "Password123");

        // When & Then
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value(containsString("prenom.nom@ca-ts.fr")));
    }

    @Test
    @DisplayName("POST /api/auth/register - Mot de passe faible")
    void testRegister_WeakPassword() throws Exception {
        // Given
        RegisterRequest request = new RegisterRequest("alice.durand@ca-ts.fr", "short");

        // When & Then
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value(containsString("8 caractères")));
    }

    @Test
    @DisplayName("POST /api/auth/register - Email déjà existant")
    void testRegister_DuplicateEmail() throws Exception {
        // Given - Créer un premier utilisateur
        RegisterRequest firstRequest = new RegisterRequest("jean.dupont@ca-ts.fr", "Password123");
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(firstRequest)));

        // When & Then - Essayer de créer un deuxième utilisateur avec le même email
        RegisterRequest duplicateRequest = new RegisterRequest("jean.dupont@ca-ts.fr", "DifferentPass123");
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value(containsString("existe déjà")));
    }

    @Test
    @DisplayName("POST /api/auth/login - Succès")
    void testLogin_Success() throws Exception {
        // Given - Créer un utilisateur d'abord
        RegisterRequest registerRequest = new RegisterRequest("marie.martin@ca-ts.fr", "Password123");
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        // When & Then - Login
        LoginRequest loginRequest = new LoginRequest("marie.martin@ca-ts.fr", "Password123");
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Connexion réussie"))
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.token").value(startsWith("eyJ"))) // JWT token
                .andExpect(jsonPath("$.user.email").value("marie.martin@ca-ts.fr"))
                .andExpect(jsonPath("$.user.firstName").value("Marie"))
                .andExpect(jsonPath("$.user.lastName").value("MARTIN"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Email inexistant")
    void testLogin_EmailNotFound() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("inconnu@ca-ts.fr", "Password123");

        // When & Then
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value(containsString("Email ou mot de passe incorrect")));
    }

    @Test
    @DisplayName("POST /api/auth/login - Mauvais mot de passe")
    void testLogin_WrongPassword() throws Exception {
        // Given - Créer un utilisateur
        RegisterRequest registerRequest = new RegisterRequest("alice.durand@ca-ts.fr", "Password123");
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        // When & Then - Essayer de se connecter avec un mauvais mot de passe
        LoginRequest loginRequest = new LoginRequest("alice.durand@ca-ts.fr", "WrongPassword123");
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value(containsString("Email ou mot de passe incorrect")));
    }

    @Test
    @DisplayName("POST /api/auth/register - Validation des champs requis")
    void testRegister_ValidationErrors() throws Exception {
        // Given - Request avec champs vides
        RegisterRequest request = new RegisterRequest("", "");

        // When & Then
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login - Case insensitive pour l'email")
    void testLogin_CaseInsensitive() throws Exception {
        // Given - Créer avec minuscules
        RegisterRequest registerRequest = new RegisterRequest("jean.dupont@ca-ts.fr", "Password123");
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        // When & Then - Login avec MAJUSCULES
        LoginRequest loginRequest = new LoginRequest("JEAN.DUPONT@CA-TS.FR", "Password123");
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Connexion réussie"));
    }
}
