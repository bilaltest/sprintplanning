package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.CreateReleaseNoteEntryRequest;
import com.catsbanque.eventplanning.dto.ReleaseNoteEntryDto;
import com.catsbanque.eventplanning.entity.Microservice;
import com.catsbanque.eventplanning.entity.Release;
import com.catsbanque.eventplanning.entity.ReleaseNoteEntry;
import com.catsbanque.eventplanning.repository.FeatureRepository;
import com.catsbanque.eventplanning.repository.MicroserviceRepository;
import com.catsbanque.eventplanning.repository.ReleaseNoteEntryRepository;
import com.catsbanque.eventplanning.repository.ReleaseRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.anyList;
import static org.mockito.Mockito.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReleaseNoteServiceTest {

    @Mock
    private ReleaseNoteEntryRepository releaseNoteEntryRepository;

    @Mock
    private ReleaseRepository releaseRepository;

    @Mock
    private MicroserviceRepository microserviceRepository;

    @Mock
    private FeatureRepository featureRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ReleaseNoteService releaseNoteService;

    private Release testRelease;
    private Microservice testMicroservice;
    private ReleaseNoteEntry testEntry;
    private CreateReleaseNoteEntryRequest createRequest;

    @BeforeEach
    void setUp() throws JsonProcessingException {
        testRelease = new Release();
        testRelease.setId("release123");
        testRelease.setName("Release v1.0");
        testRelease.setSlug("release-v1-0");
        testRelease.setReleaseDate(LocalDateTime.of(2025, 6, 15, 10, 0));

        testMicroservice = Microservice.builder()
                .id("ms123")
                .name("payment-service")
                .squad("Squad 3")
                .solution("Financial Services")
                .displayOrder(0)
                .isActive(true)
                .build();

        testEntry = new ReleaseNoteEntry();
        testEntry.setId("entry123");
        testEntry.setReleaseId("release123");
        testEntry.setMicroserviceId("ms123");
        testEntry.setMicroservice("payment-service");
        testEntry.setSquad("Squad 3");
        testEntry.setPartEnMep(true);
        testEntry.setDeployOrder(1);
        testEntry.setTag("v1.2.3");
        testEntry.setPreviousTag("v1.2.2");
        testEntry.setParentVersion("v1.2.0");
        testEntry.setComment("Test comment");
        testEntry.setChanges("[{\"jiraId\":\"JIRA-123\",\"description\":\"Fix bug\"}]");

        createRequest = new CreateReleaseNoteEntryRequest();
        createRequest.setMicroserviceId("ms123");
        createRequest.setSquad("Squad 3");
        createRequest.setPartEnMep(true);
        createRequest.setDeployOrder(1);
        createRequest.setTag("v1.2.3");
        createRequest.setPreviousTag("v1.2.2");
        createRequest.setParentVersion("v1.2.0");
        createRequest.setComment("Test comment");

        ReleaseNoteEntryDto.ChangeItem change = new ReleaseNoteEntryDto.ChangeItem();
        change.setJiraId("JIRA-123");
        change.setDescription("Fix bug");
        createRequest.setChanges(List.of(change));
    }

    @Test
    void getAllEntries_WithValidReleaseId_ShouldReturnEntries() throws JsonProcessingException {
        // Given
        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseNoteEntryRepository.findByReleaseIdOrderBySquadAndDeployOrder("release123"))
                .thenReturn(Collections.singletonList(testEntry));
        when(microserviceRepository.findById("ms123")).thenReturn(Optional.of(testMicroservice));

        List<ReleaseNoteEntryDto.ChangeItem> changes = new ArrayList<>();
        ReleaseNoteEntryDto.ChangeItem change = new ReleaseNoteEntryDto.ChangeItem();
        change.setJiraId("JIRA-123");
        change.setDescription("Fix bug");
        changes.add(change);
        when(objectMapper.readValue(anyString(), any(TypeReference.class))).thenReturn(changes);

        // When
        List<ReleaseNoteEntryDto> result = releaseNoteService.getAllEntries("release123");

        // Then
        assertThat(result).hasSize(1);
        verify(releaseRepository).findById("release123");
        verify(releaseNoteEntryRepository).findByReleaseIdOrderBySquadAndDeployOrder("release123");
    }

    @Test
    void getAllEntries_WithValidSlug_ShouldReturnEntries() throws JsonProcessingException {
        // Given
        when(releaseRepository.findBySlug("release-v1-0")).thenReturn(Optional.of(testRelease));
        when(releaseNoteEntryRepository.findByReleaseIdOrderBySquadAndDeployOrder("release123"))
                .thenReturn(Collections.singletonList(testEntry));
        when(microserviceRepository.findById("ms123")).thenReturn(Optional.of(testMicroservice));

        List<ReleaseNoteEntryDto.ChangeItem> changes = new ArrayList<>();
        when(objectMapper.readValue(anyString(), any(TypeReference.class))).thenReturn(changes);

        // When
        List<ReleaseNoteEntryDto> result = releaseNoteService.getAllEntries("release-v1-0");

        // Then
        assertThat(result).hasSize(1);
        verify(releaseRepository).findBySlug("release-v1-0");
        verify(releaseRepository, never()).findById(any());
    }

    @Test
    void getAllEntries_WithInvalidReleaseId_ShouldThrowException() {
        // Given
        when(releaseRepository.findBySlug("invalid")).thenReturn(Optional.empty());
        when(releaseRepository.findById("invalid")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> releaseNoteService.getAllEntries("invalid"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Release non trouvée");
    }

    @Test
    void createEntry_WithMicroserviceId_ShouldCreateEntry() throws JsonProcessingException {
        // Given
        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(microserviceRepository.findById("ms123")).thenReturn(Optional.of(testMicroservice));
        when(releaseNoteEntryRepository.save(any(ReleaseNoteEntry.class))).thenReturn(testEntry);
        when(objectMapper.writeValueAsString(anyList()))
                .thenReturn("[{\"jiraId\":\"JIRA-123\",\"description\":\"Fix bug\"}]");

        List<ReleaseNoteEntryDto.ChangeItem> changes = new ArrayList<>();
        when(objectMapper.readValue(anyString(), any(TypeReference.class))).thenReturn(changes);

        // When
        ReleaseNoteEntryDto result = releaseNoteService.createEntry("release123", createRequest);

        // Then
        assertThat(result).isNotNull();
        verify(releaseNoteEntryRepository).save(argThat(entry -> {
            assertThat(entry.getReleaseId()).isEqualTo("release123");
            assertThat(entry.getMicroserviceId()).isEqualTo("ms123");
            assertThat(entry.getSquad()).isEqualTo("Squad 3");
            return true;
        }));
        verify(objectMapper).writeValueAsString(anyList());
    }

    @Test
    void createEntry_WithLegacyMicroserviceName_ShouldCreateEntry() throws JsonProcessingException {
        // Given
        createRequest.setMicroserviceId(null);
        createRequest.setMicroservice("legacy-service");

        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseNoteEntryRepository.save(any(ReleaseNoteEntry.class))).thenReturn(testEntry);

        // When
        ReleaseNoteEntryDto result = releaseNoteService.createEntry("release123", createRequest);

        // Then
        assertThat(result).isNotNull();
        verify(releaseNoteEntryRepository).save(argThat(entry -> {
            assertThat(entry.getMicroservice()).isEqualTo("legacy-service");
            return true;
        }));
    }

    @Test
    void createEntry_WithJsonError_ShouldSetEmptyChanges() throws JsonProcessingException {
        // Given
        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(microserviceRepository.findById("ms123")).thenReturn(Optional.of(testMicroservice));
        when(objectMapper.writeValueAsString(anyList())).thenThrow(new JsonProcessingException("Error") {
        });
        when(releaseNoteEntryRepository.save(any(ReleaseNoteEntry.class))).thenReturn(testEntry);

        // When
        ReleaseNoteEntryDto result = releaseNoteService.createEntry("release123", createRequest);

        // Then
        assertThat(result).isNotNull();
        verify(releaseNoteEntryRepository).save(argThat(entry -> {
            assertThat(entry.getChanges()).isEqualTo("[]");
            return true;
        }));
    }

    @Test
    void updateEntry_WithValidData_ShouldUpdateEntry() throws JsonProcessingException {
        // Given
        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseNoteEntryRepository.findById("entry123")).thenReturn(Optional.of(testEntry));
        when(microserviceRepository.findById("ms123")).thenReturn(Optional.of(testMicroservice));
        when(releaseNoteEntryRepository.save(any(ReleaseNoteEntry.class))).thenReturn(testEntry);

        createRequest.setTag("v1.2.4");

        // When
        ReleaseNoteEntryDto result = releaseNoteService.updateEntry("release123", "entry123", createRequest);

        // Then
        assertThat(result).isNotNull();
        verify(releaseNoteEntryRepository).save(argThat(entry -> {
            assertThat(entry.getTag()).isEqualTo("v1.2.4");
            return true;
        }));
    }

    @Test
    void updateEntry_WithWrongRelease_ShouldThrowException() {
        // Given
        testEntry.setReleaseId("differentRelease");

        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseNoteEntryRepository.findById("entry123")).thenReturn(Optional.of(testEntry));

        // When & Then
        assertThatThrownBy(() -> releaseNoteService.updateEntry("release123", "entry123", createRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("n'appartient pas à cette release");
    }

    @Test
    void updateEntry_WithInvalidEntryId_ShouldThrowException() {
        // Given
        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseNoteEntryRepository.findById("invalid")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> releaseNoteService.updateEntry("release123", "invalid", createRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Entrée non trouvée");
    }

    @Test
    void deleteEntry_WithValidData_ShouldDeleteEntry() {
        // Given
        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseNoteEntryRepository.findById("entry123")).thenReturn(Optional.of(testEntry));

        // When
        releaseNoteService.deleteEntry("release123", "entry123");

        // Then
        verify(releaseNoteEntryRepository).delete(testEntry);
    }

    @Test
    void deleteEntry_WithWrongRelease_ShouldThrowException() {
        // Given
        testEntry.setReleaseId("differentRelease");

        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseNoteEntryRepository.findById("entry123")).thenReturn(Optional.of(testEntry));

        // When & Then
        assertThatThrownBy(() -> releaseNoteService.deleteEntry("release123", "entry123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("n'appartient pas à cette release");
    }

    @Test
    void getAllPreviousTags_ShouldReturnTagsMap() {
        // Given
        ReleaseNoteEntry entry1 = new ReleaseNoteEntry();
        entry1.setMicroserviceId("ms1");
        entry1.setTag("v1.0.0");

        ReleaseNoteEntry entry2 = new ReleaseNoteEntry();
        entry2.setMicroserviceId("ms2");
        entry2.setTag("v2.0.0");

        when(releaseNoteEntryRepository.findAllPreviousTagsForRelease("release123"))
                .thenReturn(Arrays.asList(entry1, entry2));

        // When
        Map<String, String> result = releaseNoteService.getAllPreviousTags("release123");

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get("ms1")).isEqualTo("v1.0.0");
        assertThat(result.get("ms2")).isEqualTo("v2.0.0");
    }

    @Test
    void getAllPreviousTags_WithNullMicroserviceId_ShouldSkipEntry() {
        // Given
        ReleaseNoteEntry entry1 = new ReleaseNoteEntry();
        entry1.setMicroserviceId(null);
        entry1.setTag("v1.0.0");

        ReleaseNoteEntry entry2 = new ReleaseNoteEntry();
        entry2.setMicroserviceId("ms2");
        entry2.setTag("v2.0.0");

        when(releaseNoteEntryRepository.findAllPreviousTagsForRelease("release123"))
                .thenReturn(Arrays.asList(entry1, entry2));

        // When
        Map<String, String> result = releaseNoteService.getAllPreviousTags("release123");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get("ms2")).isEqualTo("v2.0.0");
    }

    @Test
    void exportMarkdown_ShouldGenerateMarkdown() throws JsonProcessingException {
        // Given
        testEntry.setPartEnMep(true);
        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseNoteEntryRepository.findByReleaseIdOrderBySquadAndDeployOrder("release123"))
                .thenReturn(Collections.singletonList(testEntry));
        when(microserviceRepository.findById("ms123")).thenReturn(Optional.of(testMicroservice));

        List<ReleaseNoteEntryDto.ChangeItem> changes = new ArrayList<>();
        when(objectMapper.readValue(anyString(), any(TypeReference.class))).thenReturn(changes);

        // When
        String result = releaseNoteService.exportMarkdown("release123");

        // Then
        assertThat(result).contains("# Release Note - Release v1.0");
        assertThat(result).contains("## Squad 3");
        assertThat(result).contains("payment-service");
        assertThat(result).contains("Financial Services");
    }

    @Test
    void exportMarkdown_ShouldOnlyIncludeDeployedEntries() throws JsonProcessingException {
        // Given
        ReleaseNoteEntry notDeployed = new ReleaseNoteEntry();
        notDeployed.setId("entry2");
        notDeployed.setReleaseId("release123");
        notDeployed.setMicroservice("not-deployed-service");
        notDeployed.setSquad("Squad 1");
        notDeployed.setPartEnMep(false);
        notDeployed.setChanges("[]");

        testEntry.setPartEnMep(true);

        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseNoteEntryRepository.findByReleaseIdOrderBySquadAndDeployOrder("release123"))
                .thenReturn(Arrays.asList(testEntry, notDeployed));
        when(microserviceRepository.findById("ms123")).thenReturn(Optional.of(testMicroservice));

        List<ReleaseNoteEntryDto.ChangeItem> changes = new ArrayList<>();
        when(objectMapper.readValue(anyString(), any(TypeReference.class))).thenReturn(changes);

        // When
        String result = releaseNoteService.exportMarkdown("release123");

        // Then
        assertThat(result).contains("payment-service");
        assertThat(result).doesNotContain("not-deployed-service");
    }

    @Test
    void exportHtml_ShouldGenerateHtml() throws JsonProcessingException {
        // Given
        testEntry.setPartEnMep(true);
        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseNoteEntryRepository.findByReleaseIdOrderBySquadAndDeployOrder("release123"))
                .thenReturn(Collections.singletonList(testEntry));
        when(microserviceRepository.findById("ms123")).thenReturn(Optional.of(testMicroservice));
        when(featureRepository.findByReleaseIdAndType("release123", "major")).thenReturn(Collections.emptyList());

        List<ReleaseNoteEntryDto.ChangeItem> changes = new ArrayList<>();
        when(objectMapper.readValue(anyString(), any(TypeReference.class))).thenReturn(changes);

        // When
        String result = releaseNoteService.exportHtml("release123");

        // Then
        assertThat(result).contains("<!DOCTYPE html>");
        assertThat(result).contains("Release Note - Release v1.0");
        assertThat(result).contains("Squad 3");
        assertThat(result).contains("payment-service");
        assertThat(result).contains("Financial Services");
    }

    @Test
    void exportHtml_ShouldOnlyIncludeDeployedEntries() throws JsonProcessingException {
        // Given
        ReleaseNoteEntry notDeployed = new ReleaseNoteEntry();
        notDeployed.setId("entry2");
        notDeployed.setReleaseId("release123");
        notDeployed.setMicroservice("not-deployed-service");
        notDeployed.setSquad("Squad 1");
        notDeployed.setPartEnMep(false);
        notDeployed.setChanges("[]");

        testEntry.setPartEnMep(true);

        when(releaseRepository.findBySlug("release123")).thenReturn(Optional.empty());
        when(releaseRepository.findById("release123")).thenReturn(Optional.of(testRelease));
        when(releaseNoteEntryRepository.findByReleaseIdOrderBySquadAndDeployOrder("release123"))
                .thenReturn(Arrays.asList(testEntry, notDeployed));
        when(microserviceRepository.findById("ms123")).thenReturn(Optional.of(testMicroservice));
        when(featureRepository.findByReleaseIdAndType("release123", "major")).thenReturn(Collections.emptyList());

        List<ReleaseNoteEntryDto.ChangeItem> changes = new ArrayList<>();
        when(objectMapper.readValue(anyString(), any(TypeReference.class))).thenReturn(changes);

        // When
        String result = releaseNoteService.exportHtml("release123");

        // Then
        assertThat(result).contains("payment-service");
        assertThat(result).doesNotContain("not-deployed-service");
    }
}
