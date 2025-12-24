package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.config.WithMockCalendarUser;
import com.catsbanque.mabanquetools.dto.CreateEventRequest;
import com.catsbanque.mabanquetools.repository.EventRepository;
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

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockCalendarUser
@DisplayName("EventController - Tests d'intégration E2E")
class EventControllerIntegrationTest {

        @Autowired
        private org.springframework.web.context.WebApplicationContext context;

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private EventRepository eventRepository;

        @BeforeEach
        void setUp() {
                mockMvc = org.springframework.test.web.servlet.setup.MockMvcBuilders
                                .webAppContextSetup(context)
                                .apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
                                                .springSecurity())
                                .build();
                eventRepository.deleteAll();
        }

        @Test
        @DisplayName("GET /api/events - Liste vide")
        void testGetAllEvents_Empty() throws Exception {
                mockMvc.perform(get("/events"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$").isEmpty());
        }

        @Test
        @DisplayName("POST /api/events - Créer événement")
        void testCreateEvent_Success() throws Exception {
                CreateEventRequest request = new CreateEventRequest(
                                "Test Event",
                                "2025-12-25",
                                null,
                                "10:00",
                                "12:00",
                                "#10b981",
                                "celebration",
                                "mep",
                                "Test description",
                                null);

                mockMvc.perform(post("/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.title").value("Test Event"))
                                .andExpect(jsonPath("$.date").value("2025-12-25"))
                                .andExpect(jsonPath("$.startTime").value("10:00"))
                                .andExpect(jsonPath("$.color").value("#10b981"))
                                .andExpect(jsonPath("$.category").value("mep"));
        }

        @Test
        @DisplayName("POST /api/events - Créer événement avec tags")
        void testCreateEvent_WithTags_Success() throws Exception {
                java.util.Set<String> tags = new java.util.HashSet<>();
                tags.add("tag1");
                tags.add("tag2");

                CreateEventRequest request = new CreateEventRequest(
                                "Tagged Event",
                                "2025-12-25",
                                null,
                                "10:00",
                                "12:00",
                                "#10b981",
                                "celebration",
                                "mep",
                                "Test description",
                                tags);

                mockMvc.perform(post("/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.title").value("Tagged Event"))
                                .andExpect(jsonPath("$.tags").isArray())
                                .andExpect(jsonPath("$.tags", hasSize(2)));
        }

        @Test
        @DisplayName("POST /api/events - Validation échouée (titre manquant)")
        void testCreateEvent_MissingTitle() throws Exception {
                CreateEventRequest request = new CreateEventRequest(
                                "",
                                "2025-12-25",
                                null,
                                null,
                                null,
                                "#10b981",
                                "celebration",
                                "mep",
                                null,
                                null);

                mockMvc.perform(post("/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("GET /api/events/:id - Récupérer événement")
        void testGetEventById_Success() throws Exception {
                // Créer un événement
                CreateEventRequest request = new CreateEventRequest(
                                "Test Event",
                                "2025-12-25",
                                null,
                                null,
                                null,
                                "#10b981",
                                "celebration",
                                "mep",
                                "Description",
                                null);

                String createResponse = mockMvc.perform(post("/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andReturn().getResponse().getContentAsString();

                String eventId = objectMapper.readTree(createResponse).get("id").asText();

                // Récupérer l'événement
                mockMvc.perform(get("/events/{id}", eventId))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(eventId))
                                .andExpect(jsonPath("$.title").value("Test Event"));
        }

        @Test
        @DisplayName("GET /api/events/:id - Événement non trouvé")
        void testGetEventById_NotFound() throws Exception {
                mockMvc.perform(get("/events/{id}", "nonexistent"))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("PUT /api/events/:id - Modifier événement")
        void testUpdateEvent_Success() throws Exception {
                // Créer un événement
                CreateEventRequest createRequest = new CreateEventRequest(
                                "Original Title",
                                "2025-12-25",
                                null,
                                null,
                                null,
                                "#10b981",
                                "celebration",
                                "mep",
                                null,
                                null);

                String createResponse = mockMvc.perform(post("/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn().getResponse().getContentAsString();

                String eventId = objectMapper.readTree(createResponse).get("id").asText();

                // Modifier l'événement
                CreateEventRequest updateRequest = new CreateEventRequest(
                                "Updated Title",
                                "2025-12-26",
                                null,
                                null,
                                null,
                                "#f59e0b",
                                "update",
                                "hotfix",
                                "Updated description",
                                null);

                mockMvc.perform(put("/events/{id}", eventId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(eventId))
                                .andExpect(jsonPath("$.title").value("Updated Title"))
                                .andExpect(jsonPath("$.date").value("2025-12-26"))
                                .andExpect(jsonPath("$.category").value("hotfix"));
        }

        @Test
        @DisplayName("DELETE /api/events/:id - Supprimer événement")
        void testDeleteEvent_Success() throws Exception {
                // Créer un événement
                CreateEventRequest request = new CreateEventRequest(
                                "Event to Delete",
                                "2025-12-25",
                                null,
                                null,
                                null,
                                "#10b981",
                                "celebration",
                                "mep",
                                null,
                                null);

                String createResponse = mockMvc.perform(post("/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andReturn().getResponse().getContentAsString();

                String eventId = objectMapper.readTree(createResponse).get("id").asText();

                // Supprimer l'événement
                mockMvc.perform(delete("/events/{id}", eventId))
                                .andExpect(status().isNoContent());

                // Vérifier qu'il n'existe plus
                mockMvc.perform(get("/events/{id}", eventId))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("GET /api/events?category=mep - Filtrer par catégorie")
        void testGetAllEvents_FilterByCategory() throws Exception {
                // Créer plusieurs événements
                CreateEventRequest event1 = new CreateEventRequest(
                                "MEP Event",
                                "2025-12-25",
                                null,
                                null,
                                null,
                                "#10b981",
                                "celebration",
                                "mep",
                                null,
                                null);

                CreateEventRequest event2 = new CreateEventRequest(
                                "Hotfix Event",
                                "2025-12-26",
                                null,
                                null,
                                null,
                                "#f59e0b",
                                "warning",
                                "hotfix",
                                null,
                                null);

                mockMvc.perform(post("/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(event1)));

                mockMvc.perform(post("/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(event2)));

                // Filtrer par catégorie MEP
                mockMvc.perform(get("/events").param("category", "mep"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$", hasSize(1)))
                                .andExpect(jsonPath("$[0].category").value("mep"));
        }

        @Test
        @DisplayName("GET /api/events?search=test - Recherche texte")
        void testGetAllEvents_SearchByText() throws Exception {
                // Créer événements
                CreateEventRequest event1 = new CreateEventRequest(
                                "Test Event",
                                "2025-12-25",
                                null,
                                null,
                                null,
                                "#10b981",
                                "celebration",
                                "mep",
                                null,
                                null);

                CreateEventRequest event2 = new CreateEventRequest(
                                "Other Event",
                                "2025-12-26",
                                null,
                                null,
                                null,
                                "#f59e0b",
                                "warning",
                                "hotfix",
                                "This is a test description",
                                null);

                mockMvc.perform(post("/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(event1)));

                mockMvc.perform(post("/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(event2)));

                // Rechercher "test"
                mockMvc.perform(get("/events").param("search", "test"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$", hasSize(2))); // Les deux contiennent "test"
        }

        @Test
        @DisplayName("GET /api/events/export/ics - Export ICS")
        void testExportEventsToIcs_Success() throws Exception {
                // Créer un événement
                CreateEventRequest event = new CreateEventRequest(
                                "ICS Test Event",
                                "2025-12-25",
                                null,
                                "10:00",
                                "12:00",
                                "#10b981",
                                "celebration",
                                "mep",
                                "Description",
                                null);

                mockMvc.perform(post("/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(event)))
                                .andExpect(status().isCreated());

                // Exporter
                mockMvc.perform(get("/events/export/ics"))
                                .andExpect(status().isOk())
                                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                                                .string("Content-Type", "text/calendar"))
                                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content()
                                                .string(org.hamcrest.Matchers.containsString("BEGIN:VCALENDAR")))
                                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content()
                                                .string(org.hamcrest.Matchers
                                                                .containsString("SUMMARY:ICS Test Event")));
        }
}
