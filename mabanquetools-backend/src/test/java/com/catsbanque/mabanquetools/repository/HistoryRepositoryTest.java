package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.History;
import com.catsbanque.mabanquetools.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class HistoryRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private HistoryRepository historyRepository;

    private User user;
    private History history1;
    private History history2;
    private History history3;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail("test@example.com");
        user.setPassword("hashed");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setThemePreference("light");
        user.setWidgetOrder("[]");
        entityManager.persist(user); // Persist first to generate ID

        history1 = new History();
        history1.setAction("create");
        history1.setEventId("event-1");
        history1.setEventData("{\"title\":\"MEP v40.5\"}");
        history1.setUserId(user.getId());
        history1.setUserDisplayName("John D.");

        history2 = new History();
        history2.setAction("update");
        history2.setEventId("event-1");
        history2.setEventData("{\"title\":\"MEP v40.5 Updated\"}");
        history2.setPreviousData("{\"title\":\"MEP v40.5\"}");
        history2.setUserId(user.getId());
        history2.setUserDisplayName("John D.");

        history3 = new History();
        history3.setAction("create");
        history3.setEventId("event-2");
        history3.setEventData("{\"title\":\"Hotfix\"}");
        history3.setUserId(user.getId());
        history3.setUserDisplayName("John D.");
    }

    @Test
    void shouldFindHistoryByEventId() {
        // Given
        entityManager.persist(history1);
        entityManager.persist(history2);
        entityManager.persist(history3);
        entityManager.flush();

        // When
        List<History> eventHistory = historyRepository.findByEventIdOrderByTimestampDesc("event-1");

        // Then
        assertThat(eventHistory).hasSize(2);
        assertThat(eventHistory.get(0).getAction()).isIn("create", "update");
    }

    @Test
    void shouldFindHistoryByUserId() {
        // Given
        entityManager.persist(history1);
        entityManager.persist(history2);
        entityManager.persist(history3);
        entityManager.flush();

        // When
        List<History> userHistory = historyRepository.findByUserIdOrderByTimestampDesc(user.getId());

        // Then
        assertThat(userHistory).hasSize(3);
    }

    @Test
    void shouldFindHistoryByAction() {
        // Given
        entityManager.persist(history1);
        entityManager.persist(history2);
        entityManager.persist(history3);
        entityManager.flush();

        // When
        List<History> creates = historyRepository.findByActionOrderByTimestampDesc("create");
        List<History> updates = historyRepository.findByActionOrderByTimestampDesc("update");

        // Then
        assertThat(creates).hasSize(2);
        assertThat(updates).hasSize(1);
    }

    @Test
    void shouldFindHistoryInDateRange() {
        // Given
        entityManager.persist(history1);
        entityManager.persist(history2);
        entityManager.persist(history3);
        entityManager.flush();

        LocalDateTime start = LocalDateTime.now().minusHours(1);
        LocalDateTime end = LocalDateTime.now().plusHours(1);

        // When
        List<History> inRange = historyRepository.findByTimestampBetweenOrderByTimestampDesc(start, end);

        // Then
        assertThat(inRange).hasSize(3);
    }

    @Test
    void shouldOrderByTimestampDescending() throws InterruptedException {
        // Given
        entityManager.persist(history1);
        Thread.sleep(10); // Ensure different timestamps
        entityManager.persist(history2);
        Thread.sleep(10);
        entityManager.persist(history3);
        entityManager.flush();

        // When
        List<History> all = historyRepository.findAllByOrderByTimestampDesc();

        // Then
        assertThat(all).hasSize(3);
        // Most recent first
        assertThat(all.get(0).getTimestamp()).isAfterOrEqualTo(all.get(1).getTimestamp());
        assertThat(all.get(1).getTimestamp()).isAfterOrEqualTo(all.get(2).getTimestamp());
    }

    @Test
    void shouldStoreEventDataAsJson() {
        // Given
        entityManager.persist(history1);
        entityManager.flush();

        // When
        History found = historyRepository.findById(history1.getId()).orElse(null);

        // Then
        assertThat(found).isNotNull();
        assertThat(found.getEventData()).contains("MEP v40.5");
        assertThat(found.getEventData()).startsWith("{");
    }
}
