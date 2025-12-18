package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.CreateReleaseRequest;
import com.catsbanque.mabanquetools.dto.ReleaseDto;
import com.catsbanque.mabanquetools.dto.UpdateReleaseRequest;
import com.catsbanque.mabanquetools.entity.Release;
import com.catsbanque.mabanquetools.entity.Squad;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.ReleaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReleaseServiceTest {

    @Mock
    private ReleaseRepository releaseRepository;

    @InjectMocks
    private ReleaseService releaseService;

    private Release testRelease;
    private CreateReleaseRequest createRequest;
    private UpdateReleaseRequest updateRequest;

    @BeforeEach
    void setUp() {
        testRelease = new Release();
        testRelease.setId("release123");
        testRelease.setName("Release v1.0");
        testRelease.setSlug("release-v1-0");
        testRelease.setReleaseDate(LocalDateTime.of(2025, 6, 15, 10, 0));
        testRelease.setType("release");
        testRelease.setStatus("draft");
        testRelease.setDescription("First release");

        List<Squad> squads = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            Squad squad = new Squad();
            squad.setId("squad" + i);
            squad.setSquadNumber(i);
            squad.setRelease(testRelease);
            squads.add(squad);
        }
        testRelease.setSquads(squads);

        createRequest = new CreateReleaseRequest();
        createRequest.setName("Release v2.0");
        createRequest.setReleaseDate("2025-07-15");
        createRequest.setType("release");
        createRequest.setDescription("Second release");

        updateRequest = new UpdateReleaseRequest();
        updateRequest.setName("Release v1.1");
        updateRequest.setStatus("active");
    }

    @Test
    void getAllReleases_ShouldReturnFutureAndPast20Releases() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        Release futureRelease = new Release();
        futureRelease.setId("future123");
        futureRelease.setName("Future Release");
        futureRelease.setReleaseDate(now.plusDays(10));
        futureRelease.setSquads(new ArrayList<>());

        Release pastRelease = new Release();
        pastRelease.setId("past123");
        pastRelease.setName("Past Release");
        pastRelease.setReleaseDate(now.minusDays(5));
        pastRelease.setSquads(new ArrayList<>());

        when(releaseRepository.findByReleaseDateAfter(any(LocalDateTime.class)))
                .thenReturn(List.of(futureRelease));
        when(releaseRepository.findTop20ByReleaseDateBeforeOrderByReleaseDateDesc(any(LocalDateTime.class)))
                .thenReturn(List.of(pastRelease));

        // When
        List<ReleaseDto> result = releaseService.getAllReleases();

        // Then
        assertThat(result).hasSize(2);
        verify(releaseRepository).findByReleaseDateAfter(any(LocalDateTime.class));
        verify(releaseRepository).findTop20ByReleaseDateBeforeOrderByReleaseDateDesc(any(LocalDateTime.class));
    }

    @Test
    void getReleaseById_WithValidId_ShouldReturnRelease() {
        // Given
        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));

        // When
        ReleaseDto result = releaseService.getReleaseById("release123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Release v1.0");
        assertThat(result.getSquads()).hasSize(6);
        verify(releaseRepository).findBySlug("release123");
        verify(releaseRepository).findById("release123");
    }

    @Test
    void getReleaseById_WithValidSlug_ShouldReturnRelease() {
        // Given
        when(releaseRepository.findBySlug("release-v1-0")).thenReturn(Optional.of(testRelease));

        // When
        ReleaseDto result = releaseService.getReleaseById("release-v1-0");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Release v1.0");
        verify(releaseRepository).findBySlug("release-v1-0");
        verify(releaseRepository, never()).findById(any());
    }

    @Test
    void getReleaseById_WithInvalidId_ShouldThrowException() {
        // Given
        when(releaseRepository.findBySlug("invalid")).thenReturn(Optional.empty());
        when(releaseRepository.findById("invalid")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> releaseService.getReleaseById("invalid"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Release not found");
    }

    @Test
    void createRelease_ShouldCreateReleaseWith6Squads() {
        // Given
        Release savedRelease = new Release();
        savedRelease.setId("newRelease123");
        savedRelease.setName("Release v2.0");
        savedRelease.setReleaseDate(LocalDateTime.of(2025, 7, 15, 0, 0));
        savedRelease.setType("release");
        savedRelease.setStatus("draft");
        savedRelease.setSquads(new ArrayList<>());

        when(releaseRepository.save(any(Release.class))).thenReturn(savedRelease);

        // When
        ReleaseDto result = releaseService.createRelease(createRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Release v2.0");
        verify(releaseRepository).save(argThat(release -> {
            assertThat(release.getSquads()).hasSize(6);
            assertThat(release.getStatus()).isEqualTo("draft");
            return true;
        }));
    }

    @Test
    void createRelease_WithDateTimeFormat_ShouldParseCorrectly() {
        // Given
        createRequest.setReleaseDate("2025-07-15T14:30:00");
        Release savedRelease = new Release();
        savedRelease.setId("newRelease123");
        savedRelease.setSquads(new ArrayList<>());

        when(releaseRepository.save(any(Release.class))).thenReturn(savedRelease);

        // When
        ReleaseDto result = releaseService.createRelease(createRequest);

        // Then
        assertThat(result).isNotNull();
        verify(releaseRepository).save(argThat(release -> {
            assertThat(release.getReleaseDate()).isNotNull();
            return true;
        }));
    }

    @Test
    void createRelease_WithISODateFormat_ShouldParseCorrectly() {
        // Given
        createRequest.setReleaseDate("2025-07-15T14:30:00.000Z");
        Release savedRelease = new Release();
        savedRelease.setId("newRelease123");
        savedRelease.setSquads(new ArrayList<>());

        when(releaseRepository.save(any(Release.class))).thenReturn(savedRelease);

        // When
        ReleaseDto result = releaseService.createRelease(createRequest);

        // Then
        assertThat(result).isNotNull();
        verify(releaseRepository).save(any(Release.class));
    }

    @Test
    void createRelease_WithInvalidDate_ShouldThrowException() {
        // Given
        createRequest.setReleaseDate("invalid-date");

        // When & Then
        assertThatThrownBy(() -> releaseService.createRelease(createRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Format de date invalide");
    }

    @Test
    void createRelease_WithNullType_ShouldDefaultToRelease() {
        // Given
        createRequest.setType(null);
        Release savedRelease = new Release();
        savedRelease.setId("newRelease123");
        savedRelease.setSquads(new ArrayList<>());

        when(releaseRepository.save(any(Release.class))).thenReturn(savedRelease);

        // When
        releaseService.createRelease(createRequest);

        // Then
        verify(releaseRepository).save(argThat(release -> {
            assertThat(release.getType()).isEqualTo("release");
            return true;
        }));
    }

    @Test
    void updateRelease_WithValidId_ShouldUpdateAndReturn() {
        // Given
        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseRepository.save(any(Release.class))).thenReturn(testRelease);

        // When
        ReleaseDto result = releaseService.updateRelease("release123", updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(releaseRepository).save(argThat(release -> {
            assertThat(release.getName()).isEqualTo("Release v1.1");
            assertThat(release.getStatus()).isEqualTo("active");
            return true;
        }));
    }

    @Test
    void updateRelease_WithSlug_ShouldUpdateAndReturn() {
        // Given
        when(releaseRepository.findBySlug("release-v1-0")).thenReturn(Optional.of(testRelease));
        when(releaseRepository.save(any(Release.class))).thenReturn(testRelease);

        // When
        ReleaseDto result = releaseService.updateRelease("release-v1-0", updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(releaseRepository).save(any(Release.class));
    }

    @Test
    void updateRelease_WithInvalidId_ShouldThrowException() {
        // Given
        when(releaseRepository.findBySlug("invalid")).thenReturn(Optional.empty());
        when(releaseRepository.findById("invalid")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> releaseService.updateRelease("invalid", updateRequest))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateReleaseStatus_ShouldUpdateStatusOnly() {
        // Given
        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseRepository.save(any(Release.class))).thenReturn(testRelease);

        // When
        ReleaseDto result = releaseService.updateReleaseStatus("release123", "completed");

        // Then
        assertThat(result).isNotNull();
        verify(releaseRepository).save(argThat(release -> {
            assertThat(release.getStatus()).isEqualTo("completed");
            return true;
        }));
    }

    @Test
    void deleteRelease_WithValidId_ShouldDelete() {
        // Given
        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));

        // When
        releaseService.deleteRelease("release123");

        // Then
        verify(releaseRepository).delete(testRelease);
    }

    @Test
    void deleteRelease_WithSlug_ShouldDelete() {
        // Given
        when(releaseRepository.findBySlug("release-v1-0")).thenReturn(Optional.of(testRelease));

        // When
        releaseService.deleteRelease("release-v1-0");

        // Then
        verify(releaseRepository).delete(testRelease);
    }

    @Test
    void deleteRelease_WithInvalidId_ShouldThrowException() {
        // Given
        when(releaseRepository.findBySlug("invalid")).thenReturn(Optional.empty());
        when(releaseRepository.findById("invalid")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> releaseService.deleteRelease("invalid"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void migrateSlugs_WithReleasesWithoutSlug_ShouldMigrate() {
        // Given
        Release releaseWithoutSlug = new Release();
        releaseWithoutSlug.setId("noSlug123");
        releaseWithoutSlug.setName("No Slug Release");
        releaseWithoutSlug.setSlug(null);

        when(releaseRepository.findAll()).thenReturn(List.of(releaseWithoutSlug));
        when(releaseRepository.save(any(Release.class))).thenReturn(releaseWithoutSlug);

        // When
        releaseService.migrateSlugs();

        // Then
        verify(releaseRepository).save(argThat(release -> {
            assertThat(release.getUpdatedAt()).isNotNull();
            return true;
        }));
    }

    @Test
    void migrateSlugs_WithAllReleasesHavingSlugs_ShouldNotMigrate() {
        // Given
        when(releaseRepository.findAll()).thenReturn(Collections.singletonList(testRelease));

        // When
        releaseService.migrateSlugs();

        // Then
        verify(releaseRepository, never()).save(any(Release.class));
    }
}
