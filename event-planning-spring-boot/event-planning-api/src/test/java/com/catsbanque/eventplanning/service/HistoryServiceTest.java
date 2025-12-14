package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.HistoryDto;
import com.catsbanque.eventplanning.entity.Event;
import com.catsbanque.eventplanning.entity.History;
import com.catsbanque.eventplanning.exception.ResourceNotFoundException;
import com.catsbanque.eventplanning.repository.EventRepository;
import com.catsbanque.eventplanning.repository.HistoryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HistoryServiceTest {

    @Mock
    private HistoryRepository historyRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private HistoryService historyService;

    private History testHistory;
    private Event testEvent;

    @BeforeEach
    void setUp() {
        testEvent = new Event();
        testEvent.setId("event123");
        testEvent.setTitle("MEP v1.0");
        testEvent.setDate("2025-01-15");
        testEvent.setColor("#10b981");
        testEvent.setIcon("rocket_launch");
        testEvent.setCategory("mep");
        testEvent.setDescription("Release v1.0");

        testHistory = new History();
        testHistory.setId("history123");
        testHistory.setAction("create");
        testHistory.setEventId("event123");
        testHistory.setEventData("{\"title\":\"MEP v1.0\"}");
        testHistory.setPreviousData(null);
        testHistory.setUserId("user123");
        testHistory.setUserDisplayName("John Doe");
        testHistory.setTimestamp(LocalDateTime.now());
    }

    @Test
    void archiveHistory_WhenExceedsLimit_ShouldDeleteOldest() {
        // Given
        when(historyRepository.count()).thenReturn(35L);

        History oldHistory1 = new History();
        oldHistory1.setId("old1");
        History oldHistory2 = new History();
        oldHistory2.setId("old2");

        when(historyRepository.findOldestEntries(5))
                .thenReturn(Arrays.asList(oldHistory1, oldHistory2));

        // When
        historyService.archiveHistory();

        // Then
        verify(historyRepository).deleteAll(any());
    }

    @Test
    void archiveHistory_WhenBelowLimit_ShouldNotDelete() {
        // Given
        when(historyRepository.count()).thenReturn(25L);

        // When
        historyService.archiveHistory();

        // Then
        verify(historyRepository, never()).deleteAll(any());
    }

    @Test
    void archiveHistory_WhenError_ShouldNotThrow() {
        // Given
        when(historyRepository.count()).thenThrow(new RuntimeException("DB error"));

        // When & Then - should not throw
        historyService.archiveHistory();
    }

    @Test
    void getHistory_ShouldReturnLast30Entries() throws JsonProcessingException {
        // Given
        when(historyRepository.count()).thenReturn(10L);
        when(historyRepository.findLast30Entries())
                .thenReturn(Arrays.asList(testHistory));
        when(objectMapper.readValue(anyString(), eq(Event.class)))
                .thenReturn(testEvent);

        // When
        List<HistoryDto> result = historyService.getHistory();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAction()).isEqualTo("create");
        assertThat(result.get(0).getEventId()).isEqualTo("event123");
    }

    @Test
    void rollbackHistory_WithCreateAction_ShouldDeleteEvent() {
        // Given
        when(historyRepository.findById("history123")).thenReturn(Optional.of(testHistory));

        // When
        historyService.rollbackHistory("history123");

        // Then
        verify(eventRepository).deleteById("event123");
        verify(historyRepository).delete(testHistory);
    }

    @Test
    void rollbackHistory_WithUpdateAction_ShouldRestoreEvent() throws JsonProcessingException {
        // Given
        testHistory.setAction("update");
        testHistory.setPreviousData("{\"title\":\"Old Title\"}");

        Event previousEvent = new Event();
        previousEvent.setId("event123");
        previousEvent.setTitle("Old Title");
        previousEvent.setDate("2025-01-10");
        previousEvent.setColor("#10b981");
        previousEvent.setIcon("event");
        previousEvent.setCategory("mep");

        when(historyRepository.findById("history123")).thenReturn(Optional.of(testHistory));
        when(objectMapper.readValue(eq(testHistory.getEventData()), eq(Event.class)))
                .thenReturn(testEvent);
        when(objectMapper.readValue(eq(testHistory.getPreviousData()), eq(Event.class)))
                .thenReturn(previousEvent);
        when(eventRepository.findById("event123")).thenReturn(Optional.of(testEvent));
        when(eventRepository.save(any(Event.class))).thenReturn(testEvent);

        // When
        historyService.rollbackHistory("history123");

        // Then
        verify(eventRepository).save(any(Event.class));
        verify(historyRepository).delete(testHistory);
    }

    @Test
    void rollbackHistory_WithDeleteAction_ShouldRecreateEvent() throws JsonProcessingException {
        // Given
        testHistory.setAction("delete");
        testHistory.setEventData("null");
        testHistory.setPreviousData("{\"title\":\"Deleted Event\"}");

        Event previousEvent = new Event();
        previousEvent.setId("event123");
        previousEvent.setTitle("Deleted Event");

        when(historyRepository.findById("history123")).thenReturn(Optional.of(testHistory));
        when(objectMapper.readValue(eq("null"), eq(Event.class)))
                .thenReturn(null);
        when(objectMapper.readValue(eq("{\"title\":\"Deleted Event\"}"), eq(Event.class)))
                .thenReturn(previousEvent);
        when(eventRepository.save(any(Event.class))).thenReturn(previousEvent);

        // When
        historyService.rollbackHistory("history123");

        // Then
        verify(eventRepository).save(previousEvent);
        verify(historyRepository).delete(testHistory);
    }

    @Test
    void rollbackHistory_WhenHistoryNotFound_ShouldThrowException() {
        // Given
        when(historyRepository.findById("history999")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> historyService.rollbackHistory("history999"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("History entry not found");
    }

    @Test
    void rollbackHistory_WithUpdateActionWhenEventNotFound_ShouldThrowException() throws JsonProcessingException {
        // Given
        testHistory.setAction("update");
        testHistory.setPreviousData("{\"title\":\"Old Title\"}");

        Event previousEvent = new Event();
        previousEvent.setId("event123");

        when(historyRepository.findById("history123")).thenReturn(Optional.of(testHistory));
        when(objectMapper.readValue(anyString(), eq(Event.class))).thenReturn(previousEvent);
        when(eventRepository.findById("event123")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> historyService.rollbackHistory("history123"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Event not found");
    }

    @Test
    void rollbackHistory_WithUnknownAction_ShouldThrowException() {
        // Given
        testHistory.setAction("unknown");
        when(historyRepository.findById("history123")).thenReturn(Optional.of(testHistory));

        // When & Then
        assertThatThrownBy(() -> historyService.rollbackHistory("history123"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Unknown action");
    }

    @Test
    void clearHistory_ShouldDeleteAll() {
        // When
        historyService.clearHistory();

        // Then
        verify(historyRepository).deleteAll();
    }

    @Test
    void getHistory_WithInvalidJson_ShouldHandleGracefully() throws JsonProcessingException {
        // Given
        when(historyRepository.count()).thenReturn(10L);
        when(historyRepository.findLast30Entries())
                .thenReturn(Arrays.asList(testHistory));
        when(objectMapper.readValue(anyString(), eq(Event.class)))
                .thenThrow(new JsonProcessingException("Invalid JSON") {});

        // When
        List<HistoryDto> result = historyService.getHistory();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEventData()).isNull();
    }
}
