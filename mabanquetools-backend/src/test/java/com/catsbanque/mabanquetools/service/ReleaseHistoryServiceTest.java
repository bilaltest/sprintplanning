package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.ReleaseHistoryDto;
import com.catsbanque.mabanquetools.entity.Release;
import com.catsbanque.mabanquetools.entity.ReleaseHistory;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.ReleaseHistoryRepository;
import com.catsbanque.mabanquetools.repository.ReleaseRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReleaseHistoryService - Unit Tests")
class ReleaseHistoryServiceTest {

    @Mock
    private ReleaseHistoryRepository releaseHistoryRepository;

    @Mock
    private ReleaseRepository releaseRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ReleaseHistoryService releaseHistoryService;

    private ReleaseHistory testHistory;

    @BeforeEach
    void setUp() {
        testHistory = new ReleaseHistory();
        testHistory.setId("hist-1");
        testHistory.setReleaseId("rel-1");
        testHistory.setAction("create");
        testHistory.setUserId("user-1");
        testHistory.setUserDisplayName("John Doe");
        testHistory.setTimestamp(java.time.LocalDateTime.now());
        testHistory.setPreviousData("{}");
        testHistory.setReleaseData("{}");
    }

    @Test
    @DisplayName("archiveReleaseHistory - Removes old entries")
    void testArchiveReleaseHistory() {
        // Given
        when(releaseHistoryRepository.count()).thenReturn(35L);
        when(releaseHistoryRepository.findOldestEntries(5)).thenReturn(List.of(new ReleaseHistory()));

        // When
        releaseHistoryService.archiveReleaseHistory();

        // Then
        verify(releaseHistoryRepository).deleteAll(anyList());
    }

    @Test
    @DisplayName("getReleaseHistory - Returns DTOs")
    void testGetReleaseHistory() {
        // Given
        when(releaseHistoryRepository.findLast30Entries()).thenReturn(List.of(testHistory));
        // Mock ObjectMapper to return some dummy node if needed, or null logic handles
        // it
        // Since parseJsonData catches JacksonException, let's verify basic flow.

        // When
        List<ReleaseHistoryDto> result = releaseHistoryService.getReleaseHistory();

        // Then
        assertEquals(1, result.size());
        assertEquals("hist-1", result.get(0).getId());
    }

    @Test
    @DisplayName("rollback - Action: Create (Delete Release)")
    void testRollback_Create() throws Exception {
        // Given
        testHistory.setAction("create");
        when(releaseHistoryRepository.findById("hist-1")).thenReturn(Optional.of(testHistory));
        when(objectMapper.readTree(anyString())).thenReturn(mock(JsonNode.class)); // avoid parsing null/error

        // When
        releaseHistoryService.rollbackReleaseHistory("hist-1");

        // Then
        verify(releaseRepository).deleteById("rel-1");
        verify(releaseHistoryRepository).delete(testHistory);
    }

    @Test
    @DisplayName("rollback - Action: Update (Restore Previous)")
    void testRollback_Update() throws Exception {
        // Given
        testHistory.setAction("update");
        // Mock existing release
        Release existingRelease = new Release();
        existingRelease.setId("rel-1");
        existingRelease.setName("New Name");

        when(releaseHistoryRepository.findById("hist-1")).thenReturn(Optional.of(testHistory));
        when(releaseRepository.findById("rel-1")).thenReturn(Optional.of(existingRelease));

        // Mock previous data
        JsonNode previousData = mock(JsonNode.class);
        when(previousData.has("name")).thenReturn(true);
        JsonNode nameNode = mock(JsonNode.class);
        when(previousData.get("name")).thenReturn(nameNode);
        when(nameNode.asText()).thenReturn("Old Name");

        when(objectMapper.readTree(anyString())).thenReturn(previousData);

        // When
        releaseHistoryService.rollbackReleaseHistory("hist-1");

        // Then
        assertEquals("Old Name", existingRelease.getName());
        verify(releaseRepository).save(existingRelease);
        verify(releaseHistoryRepository).delete(testHistory);
    }

    @Test
    @DisplayName("rollback - Action: Delete (Recreate Release)")
    void testRollback_Delete() throws Exception {
        // Given
        testHistory.setAction("delete");
        when(releaseHistoryRepository.findById("hist-1")).thenReturn(Optional.of(testHistory));

        // Mock previous data to restore release
        JsonNode previousData = mock(JsonNode.class);
        when(previousData.has("id")).thenReturn(true);
        JsonNode idNode = mock(JsonNode.class);
        when(previousData.get("id")).thenReturn(idNode);
        when(idNode.asText()).thenReturn("rel-1");

        when(previousData.has("name")).thenReturn(true);
        JsonNode nameNode = mock(JsonNode.class);
        when(previousData.get("name")).thenReturn(nameNode);
        when(nameNode.asText()).thenReturn("Restored Release");

        when(objectMapper.readTree(anyString())).thenReturn(previousData);

        // When
        releaseHistoryService.rollbackReleaseHistory("hist-1");

        // Then
        verify(releaseRepository)
                .save(argThat(r -> r.getId().equals("rel-1") && r.getName().equals("Restored Release")));
        verify(releaseHistoryRepository).delete(testHistory);
    }

    @Test
    @DisplayName("clearReleaseHistory - Success")
    void testClearReleaseHistory() {
        // When
        releaseHistoryService.clearReleaseHistory();

        // Then
        verify(releaseHistoryRepository).deleteAll();
    }
}
