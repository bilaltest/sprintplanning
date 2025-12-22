package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.config.WithMockCalendarUser;
import com.catsbanque.mabanquetools.entity.ClosedDay;
import com.catsbanque.mabanquetools.repository.ClosedDayRepository;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockCalendarUser
class ClosedDayControllerTest {

        @Autowired
        private org.springframework.web.context.WebApplicationContext context;

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ClosedDayRepository closedDayRepository;

        @Autowired
        private ObjectMapper objectMapper;

        @BeforeEach
        void setUp() {
                mockMvc = org.springframework.test.web.servlet.setup.MockMvcBuilders
                                .webAppContextSetup(context)
                                .apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
                                                .springSecurity())
                                .build();
                closedDayRepository.deleteAll();
        }

        @Test
        void getAllClosedDays() throws Exception {
                ClosedDay day1 = new ClosedDay(null, "2024-01-01", "New Year");
                closedDayRepository.save(day1);

                mockMvc.perform(get("/closed-days"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)))
                                .andExpect(jsonPath("$[0].date").value("2024-01-01"));
        }

        @Test
        void createClosedDay() throws Exception {
                ClosedDay day = new ClosedDay(null, "2024-07-14", "National Day");

                mockMvc.perform(post("/closed-days")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(day)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.reason").value("National Day"));
        }

        @Test
        void deleteClosedDay() throws Exception {
                ClosedDay day = new ClosedDay(null, "2024-05-01", "Labor Day");
                day = closedDayRepository.save(day);

                mockMvc.perform(delete("/closed-days/" + day.getId()))
                                .andExpect(status().isNoContent());

                mockMvc.perform(get("/closed-days"))
                                .andExpect(jsonPath("$", hasSize(0)));
        }
}
