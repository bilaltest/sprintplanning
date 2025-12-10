package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.Event;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class EventRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private EventRepository eventRepository;

    private Event event1;
    private Event event2;
    private Event event3;

    @BeforeEach
    void setUp() {
        event1 = new Event();
        event1.setId("event-1");
        event1.setTitle("MEP v40.5");
        event1.setDate("2025-01-15");
        event1.setStartTime("09:00");
        event1.setEndTime("12:00");
        event1.setColor("#10b981");
        event1.setIcon("rocket_launch");
        event1.setCategory("mep");
        event1.setDescription("Mise en production v40.5");

        event2 = new Event();
        event2.setId("event-2");
        event2.setTitle("Hotfix 40.4.1");
        event2.setDate("2025-01-20");
        event2.setStartTime("14:00");
        event2.setColor("#f59e0b");
        event2.setIcon("build");
        event2.setCategory("hotfix");

        event3 = new Event();
        event3.setId("event-3");
        event3.setTitle("PI Planning Q1");
        event3.setDate("2025-02-10");
        event3.setEndDate("2025-02-11");
        event3.setColor("#3b82f6");
        event3.setIcon("event");
        event3.setCategory("pi_planning");
    }

    @Test
    void shouldFindEventsByCategory() {
        // Given
        entityManager.persist(event1);
        entityManager.persist(event2);
        entityManager.persist(event3);
        entityManager.flush();

        // When
        List<Event> mepEvents = eventRepository.findByCategory("mep");
        List<Event> hotfixEvents = eventRepository.findByCategory("hotfix");

        // Then
        assertThat(mepEvents).hasSize(1);
        assertThat(mepEvents.get(0).getTitle()).isEqualTo("MEP v40.5");
        assertThat(hotfixEvents).hasSize(1);
        assertThat(hotfixEvents.get(0).getTitle()).isEqualTo("Hotfix 40.4.1");
    }

    @Test
    void shouldFindEventsInDateRange() {
        // Given
        entityManager.persist(event1);
        entityManager.persist(event2);
        entityManager.persist(event3);
        entityManager.flush();

        // When
        List<Event> events = eventRepository.findEventsInDateRange("2025-01-01", "2025-01-31");

        // Then
        assertThat(events).hasSize(2);
        assertThat(events.get(0).getDate()).isEqualTo("2025-01-15");
        assertThat(events.get(1).getDate()).isEqualTo("2025-01-20");
    }

    @Test
    void shouldFindEventsByDate() {
        // Given
        Event event4 = new Event();
        event4.setId("event-4");
        event4.setTitle("Morning Event");
        event4.setDate("2025-01-15");
        event4.setStartTime("08:00");
        event4.setColor("#10b981");
        event4.setIcon("event");
        event4.setCategory("other");

        entityManager.persist(event1);
        entityManager.persist(event4);
        entityManager.flush();

        // When
        List<Event> eventsOnDate = eventRepository.findByDateOrderByStartTimeAsc("2025-01-15");

        // Then
        assertThat(eventsOnDate).hasSize(2);
        assertThat(eventsOnDate.get(0).getStartTime()).isEqualTo("08:00");
        assertThat(eventsOnDate.get(1).getStartTime()).isEqualTo("09:00");
    }

    @Test
    void shouldFindByCategoryAndDateRange() {
        // Given
        entityManager.persist(event1);
        entityManager.persist(event2);
        entityManager.persist(event3);
        entityManager.flush();

        // When
        List<Event> mepInJanuary = eventRepository.findByCategoryAndDateRange(
            "mep", "2025-01-01", "2025-01-31"
        );

        // Then
        assertThat(mepInJanuary).hasSize(1);
        assertThat(mepInJanuary.get(0).getTitle()).isEqualTo("MEP v40.5");
    }

    @Test
    void shouldFindAllOrderedByDate() {
        // Given
        entityManager.persist(event3);
        entityManager.persist(event1);
        entityManager.persist(event2);
        entityManager.flush();

        // When
        List<Event> allEvents = eventRepository.findAllByOrderByDateAscStartTimeAsc();

        // Then
        assertThat(allEvents).hasSize(3);
        assertThat(allEvents.get(0).getDate()).isEqualTo("2025-01-15");
        assertThat(allEvents.get(1).getDate()).isEqualTo("2025-01-20");
        assertThat(allEvents.get(2).getDate()).isEqualTo("2025-02-10");
    }

    @Test
    void shouldHandleEventWithEndDate() {
        // Given
        entityManager.persist(event3);
        entityManager.flush();

        // When
        Event found = eventRepository.findById("event-3").orElse(null);

        // Then
        assertThat(found).isNotNull();
        assertThat(found.getDate()).isEqualTo("2025-02-10");
        assertThat(found.getEndDate()).isEqualTo("2025-02-11");
    }
}
