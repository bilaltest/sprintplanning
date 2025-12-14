package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.config.WithMockCalendarUser;
import com.catsbanque.eventplanning.dto.CreateReleaseRequest;
import com.catsbanque.eventplanning.repository.ReleaseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockCalendarUser
@DisplayName("ReleaseController - Tests d'intégration E2E")
class ReleaseControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReleaseRepository releaseRepository;

    @BeforeEach
    void setUp() {
        releaseRepository.deleteAll();
    }

    @Test
    @DisplayName("GET /api/releases - Liste vide")
    void testGetAllReleases_Empty() throws Exception {
        mockMvc.perform(get("/releases"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @DisplayName("POST /api/releases - Créer release avec 6 squads")
    void testCreateRelease_Success() throws Exception {
        CreateReleaseRequest request = new CreateReleaseRequest(
                "Release v1.0.0",
                "2025-12-25T10:00:00",
                "release",
                "Test release description"
        );

        mockMvc.perform(post("/releases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Release v1.0.0"))
                .andExpect(jsonPath("$.status").value("draft"))
                .andExpect(jsonPath("$.squads").isArray())
                .andExpect(jsonPath("$.squads", hasSize(6)))
                .andExpect(jsonPath("$.squads[0].squadNumber").value(1))
                .andExpect(jsonPath("$.squads[5].squadNumber").value(6));
    }

    @Test
    @DisplayName("POST /api/releases - Validation échouée (nom manquant)")
    void testCreateRelease_MissingName() throws Exception {
        CreateReleaseRequest request = new CreateReleaseRequest(
                "",
                "2025-12-25T10:00:00",
                "release",
                null
        );

        mockMvc.perform(post("/releases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/releases/:id - Récupérer release par ID")
    void testGetReleaseById_Success() throws Exception {
        // Créer une release
        CreateReleaseRequest request = new CreateReleaseRequest(
                "Release v1.0.0",
                "2025-12-25T10:00:00",
                "release",
                "Description"
        );

        String createResponse = mockMvc.perform(post("/releases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String releaseId = objectMapper.readTree(createResponse).get("id").asText();

        // Récupérer la release
        mockMvc.perform(get("/releases/{id}", releaseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(releaseId))
                .andExpect(jsonPath("$.name").value("Release v1.0.0"))
                .andExpect(jsonPath("$.squads", hasSize(6)));
    }

    @Test
    @DisplayName("GET /api/releases/:id - Récupérer release par nom")
    void testGetReleaseByName_Success() throws Exception {
        // Créer une release
        CreateReleaseRequest request = new CreateReleaseRequest(
                "Release v1.0.0",
                "2025-12-25T10:00:00",
                "release",
                "Description"
        );

        String createResponse = mockMvc.perform(post("/releases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String releaseId = objectMapper.readTree(createResponse).get("id").asText();

        // Récupérer par ID
        mockMvc.perform(get("/releases/{id}", releaseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Release v1.0.0"));
    }

    @Test
    @DisplayName("PUT /api/releases/:id - Modifier release")
    void testUpdateRelease_Success() throws Exception {
        // Créer une release
        CreateReleaseRequest createRequest = new CreateReleaseRequest(
                "Release v1.0.0",
                "2025-12-25T10:00:00",
                "release",
                "Original description"
        );

        String createResponse = mockMvc.perform(post("/releases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String releaseId = objectMapper.readTree(createResponse).get("id").asText();

        // Modifier la release
        CreateReleaseRequest updateRequest = new CreateReleaseRequest(
                "Release v1.1.0",
                "2025-12-26T10:00:00",
                "hotfix",
                "Updated description"
        );

        mockMvc.perform(put("/releases/{id}", releaseId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(releaseId))
                .andExpect(jsonPath("$.name").value("Release v1.1.0"))
                .andExpect(jsonPath("$.type").value("hotfix"));
    }

    @Test
    @DisplayName("PATCH /api/releases/:id/status - Changer statut")
    void testUpdateReleaseStatus_Success() throws Exception {
        // Créer une release
        CreateReleaseRequest request = new CreateReleaseRequest(
                "Release v1.0.0",
                "2025-12-25T10:00:00",
                "release",
                "Description"
        );

        String createResponse = mockMvc.perform(post("/releases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String releaseId = objectMapper.readTree(createResponse).get("id").asText();

        // Changer le statut
        Map<String, String> statusUpdate = Map.of("status", "in_progress");

        mockMvc.perform(patch("/releases/{id}/status", releaseId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(releaseId))
                .andExpect(jsonPath("$.status").value("in_progress"));
    }

    @Test
    @DisplayName("DELETE /api/releases/:id - Supprimer release")
    void testDeleteRelease_Success() throws Exception {
        // Créer une release
        CreateReleaseRequest request = new CreateReleaseRequest(
                "Release to Delete",
                "2025-12-25T10:00:00",
                "release",
                "Description"
        );

        String createResponse = mockMvc.perform(post("/releases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String releaseId = objectMapper.readTree(createResponse).get("id").asText();

        // Supprimer la release
        mockMvc.perform(delete("/releases/{id}", releaseId))
                .andExpect(status().isNoContent());

        // Vérifier qu'elle n'existe plus
        mockMvc.perform(get("/releases/{id}", releaseId))
                .andExpect(status().isNotFound());
    }
}
