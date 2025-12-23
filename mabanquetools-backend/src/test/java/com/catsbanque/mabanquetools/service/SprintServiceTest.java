package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.entity.Event;
import com.catsbanque.mabanquetools.entity.Sprint;
import com.catsbanque.mabanquetools.repository.EventRepository;
import com.catsbanque.mabanquetools.repository.SprintRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SprintService - Unit Tests")
class SprintServiceTest {

    @Mock
    private SprintRepository sprintRepository;

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private SprintService sprintService;

    private Sprint testSprint;

    @BeforeEach
    void setUp() {
        testSprint = new Sprint();
        testSprint.setId("sprint-1");
        testSprint.setName("S1-2024");
        testSprint.setStartDate("2024-01-01");
        testSprint.setEndDate("2024-01-14");
        testSprint.setCodeFreezeDate("2024-01-10");
        testSprint.setReleaseDateBack("2024-01-15");
        testSprint.setReleaseDateFront("2024-01-16");
    }

    @Test
    @DisplayName("getAllSprints - Success")
    void testGetAllSprints() {
        // Given
        when(sprintRepository.findAllByOrderByStartDateDesc()).thenReturn(List.of(testSprint));

        // When
        List<Sprint> result = sprintService.getAllSprints();

        // Then
        assertEquals(1, result.size());
        assertEquals("S1-2024", result.getFirst().getName());
    }

    @Test
    @DisplayName("createSprint - Success")
    void testCreateSprint() {
        // Given
        when(sprintRepository.save(any(Sprint.class))).thenReturn(testSprint);

        // When
        Sprint result = sprintService.createSprint(testSprint);

        // Then
        assertNotNull(result);
        assertEquals("S1-2024", result.getName());
        // Verify creation of 3 events: Freeze, MEP Back, MEP Front
        verify(eventRepository, times(3)).save(any(Event.class));
    }

    @Test
    @DisplayName("updateSprint - Success with Event Update")
    void testUpdateSprint_Success() {
        // Given
        Sprint updateDetails = new Sprint();
        updateDetails.setName("S1-2024-Updated");
        updateDetails.setStartDate("2024-02-01");
        updateDetails.setEndDate("2024-02-14");
        updateDetails.setCodeFreezeDate("2024-02-10");
        updateDetails.setReleaseDateBack("2024-02-15");
        updateDetails.setReleaseDateFront("2024-02-16");

        when(sprintRepository.findById("sprint-1")).thenReturn(Optional.of(testSprint));
        when(sprintRepository.save(any(Sprint.class))).thenAnswer(i -> i.getArgument(0));

        // Mock existing events for migration/update tests relative to original dates
        Event freezeEvent = new Event();
        freezeEvent.setCategory("code_freeze");

        Event mepFrontEvent = new Event();
        mepFrontEvent.setCategory("mep_front");

        when(eventRepository.findBySprintId("sprint-1")).thenReturn(List.of(freezeEvent, mepFrontEvent));

        // When
        Sprint result = sprintService.updateSprint("sprint-1", updateDetails);

        // Then
        assertEquals("S1-2024-Updated", result.getName());
        verify(sprintRepository).save(any(Sprint.class));

        // Check if existing events are saved (updated)
        verify(eventRepository, atLeast(2)).save(any(Event.class));

        // Because "mepBack" event mock was missing in findBySprintId, the service
        // should CREATE it
        // existing: 2 update saves.
        // missing mepBack: 1 create save.
        // Total at least 3 saves.
        verify(eventRepository, atLeast(3)).save(any(Event.class));
    }

    @Test
    @DisplayName("updateSprint - Helper: Migration of legacy 'mep' event")
    void testUpdateSprint_MigrationMep() {
        // Given
        Sprint updateDetails = new Sprint();
        updateDetails.setName("S1");
        updateDetails.setReleaseDateFront("2024-03-01");
        // ... fill mostly just strict necessary logic if desired, but reusing setup is
        // fine

        when(sprintRepository.findById("sprint-1")).thenReturn(Optional.of(testSprint));
        when(sprintRepository.save(any(Sprint.class))).thenReturn(testSprint);

        // Legacy event
        Event legacyMep = new Event();
        legacyMep.setCategory("mep");
        legacyMep.setTitle("Old MEP");

        when(eventRepository.findBySprintId("sprint-1")).thenReturn(List.of(legacyMep));

        // When
        sprintService.updateSprint("sprint-1", updateDetails);

        // Then
        // Legacy 'mep' should be updated to 'mep_front'
        assertEquals("mep_front", legacyMep.getCategory());
        assertEquals("rocket_launch", legacyMep.getIcon());
        verify(eventRepository, atLeast(1)).save(legacyMep);
    }

    @Test
    @DisplayName("deleteSprint - Success")
    void testDeleteSprint_Success() {
        // Given
        when(sprintRepository.existsById("sprint-1")).thenReturn(true);

        // When
        sprintService.deleteSprint("sprint-1");

        // Then
        verify(eventRepository).deleteBySprintId("sprint-1");
        verify(sprintRepository).deleteById("sprint-1");
    }

    @Test
    @DisplayName("deleteSprint - Not Found")
    void testDeleteSprint_NotFound() {
        // Given
        when(sprintRepository.existsById("unknown")).thenReturn(false);

        // When & Then
        assertThrows(RuntimeException.class, () -> sprintService.deleteSprint("unknown"));
    }
}
