package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.CreateEventRequest;
import com.catsbanque.eventplanning.dto.EventDto;
import com.catsbanque.eventplanning.entity.Event;
import com.catsbanque.eventplanning.entity.User;
import com.catsbanque.eventplanning.exception.ResourceNotFoundException;
import com.catsbanque.eventplanning.repository.EventRepository;
import com.catsbanque.eventplanning.repository.HistoryRepository;
import com.catsbanque.eventplanning.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private HistoryRepository historyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private EventService eventService;

    private Event testEvent;
    private User testUser;
    private CreateEventRequest createRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("user123");
        testUser.setEmail("test@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");

        testEvent = new Event();
        testEvent.setId("event123");
        testEvent.setTitle("MEP v1.0");
        testEvent.setDate("2025-01-15");
        testEvent.setColor("#10b981");
        testEvent.setIcon("rocket_launch");
        testEvent.setCategory("mep");
        testEvent.setDescription("Release v1.0");

        createRequest = new CreateEventRequest();
        createRequest.setTitle("MEP v1.0");
        createRequest.setDate("2025-01-15");
        createRequest.setColor("#10b981");
        createRequest.setIcon("rocket_launch");
        createRequest.setCategory("mep");
        createRequest.setDescription("Release v1.0");
    }

    @Test
    void getAllEvents_WithoutFilters_ShouldReturnAllEvents() {
        // Given
        List<Event> events = Arrays.asList(testEvent);
        when(eventRepository.findAll()).thenReturn(events);

        // When
        List<EventDto> result = eventService.getAllEvents(null, null, null, null);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("MEP v1.0");
    }

    @Test
    void getAllEvents_WithCategory_ShouldFilterByCategory() {
        // Given
        when(eventRepository.findByCategory("mep")).thenReturn(Arrays.asList(testEvent));

        // When
        List<EventDto> result = eventService.getAllEvents("mep", null, null, null);

        // Then
        assertThat(result).hasSize(1);
        verify(eventRepository).findByCategory("mep");
    }

    @Test
    void getAllEvents_WithDateRange_ShouldFilterByDates() {
        // Given
        when(eventRepository.findByDateBetween("2025-01-01", "2025-01-31"))
                .thenReturn(Arrays.asList(testEvent));

        // When
        List<EventDto> result = eventService.getAllEvents(null, "2025-01-01", "2025-01-31", null);

        // Then
        assertThat(result).hasSize(1);
        verify(eventRepository).findByDateBetween("2025-01-01", "2025-01-31");
    }

    @Test
    void getAllEvents_WithSearch_ShouldSearchByTitleOrDescription() {
        // Given
        when(eventRepository.searchByTitleOrDescription("v1.0"))
                .thenReturn(Arrays.asList(testEvent));

        // When
        List<EventDto> result = eventService.getAllEvents(null, null, null, "v1.0");

        // Then
        assertThat(result).hasSize(1);
        verify(eventRepository).searchByTitleOrDescription("v1.0");
    }

    @Test
    void getAllEvents_WithDateFrom_ShouldFilterByMinDate() {
        // Given
        when(eventRepository.findByDateAfter("2025-01-01"))
                .thenReturn(Arrays.asList(testEvent));

        // When
        List<EventDto> result = eventService.getAllEvents(null, "2025-01-01", null, null);

        // Then
        assertThat(result).hasSize(1);
        verify(eventRepository).findByDateAfter("2025-01-01");
    }

    @Test
    void getAllEvents_WithDateTo_ShouldFilterByMaxDate() {
        // Given
        when(eventRepository.findByDateBefore("2025-12-31"))
                .thenReturn(Arrays.asList(testEvent));

        // When
        List<EventDto> result = eventService.getAllEvents(null, null, "2025-12-31", null);

        // Then
        assertThat(result).hasSize(1);
        verify(eventRepository).findByDateBefore("2025-12-31");
    }

    @Test
    void getEventById_WhenExists_ShouldReturnEvent() {
        // Given
        when(eventRepository.findById("event123")).thenReturn(Optional.of(testEvent));

        // When
        EventDto result = eventService.getEventById("event123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("MEP v1.0");
    }

    @Test
    void getEventById_WhenNotFound_ShouldThrowException() {
        // Given
        when(eventRepository.findById("event999")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> eventService.getEventById("event999"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Event not found");
    }

    @Test
    void createEvent_ShouldSaveAndReturnEvent() {
        // Given
        when(eventRepository.save(any(Event.class))).thenReturn(testEvent);
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        // When
        EventDto result = eventService.createEvent(createRequest, "user123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("MEP v1.0");
        verify(eventRepository).save(any(Event.class));
        verify(historyRepository).save(any());
    }

    @Test
    void updateEvent_WhenExists_ShouldUpdateAndReturn() {
        // Given
        when(eventRepository.findById("event123")).thenReturn(Optional.of(testEvent));

        Event updatedEvent = new Event();
        updatedEvent.setId("event123");
        updatedEvent.setTitle("MEP v2.0");
        updatedEvent.setDate("2025-02-15");
        updatedEvent.setColor("#10b981");
        updatedEvent.setIcon("rocket_launch");
        updatedEvent.setCategory("mep");

        when(eventRepository.save(any(Event.class))).thenReturn(updatedEvent);
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        CreateEventRequest updateRequest = new CreateEventRequest();
        updateRequest.setTitle("MEP v2.0");
        updateRequest.setDate("2025-02-15");
        updateRequest.setColor("#10b981");
        updateRequest.setIcon("rocket_launch");
        updateRequest.setCategory("mep");

        // When
        EventDto result = eventService.updateEvent("event123", updateRequest, "user123");

        // Then
        assertThat(result).isNotNull();
        verify(eventRepository).save(any(Event.class));
        verify(historyRepository).save(any());
    }

    @Test
    void updateEvent_WhenNotFound_ShouldThrowException() {
        // Given
        when(eventRepository.findById("event999")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> eventService.updateEvent("event999", createRequest, "user123"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Event not found");
    }

    @Test
    void deleteEvent_WhenExists_ShouldDelete() {
        // Given
        when(eventRepository.findById("event123")).thenReturn(Optional.of(testEvent));
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        // When
        eventService.deleteEvent("event123", "user123");

        // Then
        verify(eventRepository).delete(testEvent);
        verify(historyRepository).save(any());
    }

    @Test
    void deleteEvent_WhenNotFound_ShouldThrowException() {
        // Given
        when(eventRepository.findById("event999")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> eventService.deleteEvent("event999", "user123"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Event not found");
    }

    @Test
    void deleteAllEvents_ShouldDeleteAll() {
        // When
        eventService.deleteAllEvents();

        // Then
        verify(eventRepository).deleteAll();
    }

    @Test
    void bulkCreateEvents_ShouldCreateMultipleEvents() {
        // Given
        CreateEventRequest request1 = new CreateEventRequest();
        request1.setTitle("Event 1");
        request1.setDate("2025-01-15");
        request1.setColor("#10b981");
        request1.setIcon("event");
        request1.setCategory("mep");

        CreateEventRequest request2 = new CreateEventRequest();
        request2.setTitle("Event 2");
        request2.setDate("2025-01-16");
        request2.setColor("#10b981");
        request2.setIcon("event");
        request2.setCategory("hotfix");

        List<CreateEventRequest> requests = Arrays.asList(request1, request2);

        Event savedEvent1 = new Event();
        savedEvent1.setId("event1");
        Event savedEvent2 = new Event();
        savedEvent2.setId("event2");

        when(eventRepository.save(any(Event.class)))
                .thenReturn(savedEvent1)
                .thenReturn(savedEvent2);

        // When
        int count = eventService.bulkCreateEvents(requests);

        // Then
        assertThat(count).isEqualTo(2);
        verify(eventRepository, times(2)).save(any(Event.class));
    }

    @Test
    void bulkCreateEvents_WithErrors_ShouldContinue() {
        // Given
        CreateEventRequest request1 = new CreateEventRequest();
        request1.setTitle("Event 1");
        request1.setDate("2025-01-15");
        request1.setColor("#10b981");
        request1.setIcon("event");
        request1.setCategory("mep");

        CreateEventRequest request2 = new CreateEventRequest();
        request2.setTitle("Event 2");
        request2.setDate("2025-01-16");
        request2.setColor("#10b981");
        request2.setIcon("event");
        request2.setCategory("hotfix");

        List<CreateEventRequest> requests = Arrays.asList(request1, request2);

        Event savedEvent = new Event();
        savedEvent.setId("event1");

        when(eventRepository.save(any(Event.class)))
                .thenReturn(savedEvent)
                .thenThrow(new RuntimeException("DB error"));

        // When
        int count = eventService.bulkCreateEvents(requests);

        // Then
        assertThat(count).isEqualTo(1);
        verify(eventRepository, times(2)).save(any(Event.class));
    }
}
