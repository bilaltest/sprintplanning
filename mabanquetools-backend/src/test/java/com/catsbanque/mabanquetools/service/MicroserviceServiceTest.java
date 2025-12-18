package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.CreateMicroserviceRequest;
import com.catsbanque.mabanquetools.dto.MicroserviceDto;
import com.catsbanque.mabanquetools.dto.UpdateMicroserviceRequest;
import com.catsbanque.mabanquetools.entity.Microservice;
import com.catsbanque.mabanquetools.repository.MicroserviceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MicroserviceServiceTest {

    @Mock
    private MicroserviceRepository microserviceRepository;

    @Mock
    private ReleaseNoteService releaseNoteService;

    @InjectMocks
    private MicroserviceService microserviceService;

    private Microservice testMicroservice;
    private CreateMicroserviceRequest createRequest;
    private UpdateMicroserviceRequest updateRequest;

    @BeforeEach
    void setUp() {
        testMicroservice = Microservice.builder()
                .id("ms123")
                .name("payment-service")
                .squad("Squad 3")
                .solution("Financial Services")
                .displayOrder(0)
                .isActive(true)
                .description("Payment processing service")
                .build();

        createRequest = new CreateMicroserviceRequest();
        createRequest.setName("new-service");
        createRequest.setSquad("Squad 1");
        createRequest.setSolution("Core Infrastructure");
        createRequest.setDisplayOrder(5);
        createRequest.setDescription("New service");

        updateRequest = new UpdateMicroserviceRequest();
        updateRequest.setName("updated-service");
        updateRequest.setSquad("Squad 2");
        updateRequest.setSolution("Updated Solution");
        updateRequest.setDisplayOrder(10);
        updateRequest.setIsActive(false);
        updateRequest.setDescription("Updated description");
    }

    @Test
    void getAllActive_WithoutReleaseId_ShouldReturnActiveMicroservices() {
        // Given
        when(microserviceRepository.findAllActive())
                .thenReturn(Collections.singletonList(testMicroservice));

        // When
        List<MicroserviceDto> result = microserviceService.getAllActive(null);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("payment-service");
        verify(microserviceRepository).findAllActive();
        verify(releaseNoteService, never()).getAllPreviousTags(any());
    }

    @Test
    void getAllActive_WithReleaseId_ShouldEnrichWithPreviousTags() {
        // Given
        Map<String, String> previousTags = new HashMap<>();
        previousTags.put("ms123", "v1.2.2");

        when(microserviceRepository.findAllActive())
                .thenReturn(Collections.singletonList(testMicroservice));
        when(releaseNoteService.getAllPreviousTags("release123"))
                .thenReturn(previousTags);

        // When
        List<MicroserviceDto> result = microserviceService.getAllActive("release123");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPreviousTag()).isEqualTo("v1.2.2");
        verify(releaseNoteService).getAllPreviousTags("release123");
    }

    @Test
    void getAllActive_WithEmptyReleaseId_ShouldNotEnrich() {
        // Given
        when(microserviceRepository.findAllActive())
                .thenReturn(Collections.singletonList(testMicroservice));

        // When
        List<MicroserviceDto> result = microserviceService.getAllActive("");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPreviousTag()).isNull();
        verify(releaseNoteService, never()).getAllPreviousTags(any());
    }

    @Test
    void getAll_ShouldReturnAllMicroservices() {
        // Given
        Microservice inactiveMicroservice = Microservice.builder()
                .id("ms2")
                .name("old-service")
                .squad("Squad 1")
                .solution("Legacy")
                .isActive(false)
                .build();

        when(microserviceRepository.findAll())
                .thenReturn(Arrays.asList(testMicroservice, inactiveMicroservice));

        // When
        List<MicroserviceDto> result = microserviceService.getAll();

        // Then
        assertThat(result).hasSize(2);
        verify(microserviceRepository).findAll();
    }

    @Test
    void getActiveBySquad_ShouldReturnSquadMicroservices() {
        // Given
        when(microserviceRepository.findActiveBySquad("Squad 3"))
                .thenReturn(Collections.singletonList(testMicroservice));

        // When
        List<MicroserviceDto> result = microserviceService.getActiveBySquad("Squad 3");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSquad()).isEqualTo("Squad 3");
        verify(microserviceRepository).findActiveBySquad("Squad 3");
    }

    @Test
    void getById_WithValidId_ShouldReturnMicroservice() {
        // Given
        when(microserviceRepository.findById("ms123"))
                .thenReturn(Optional.of(testMicroservice));

        // When
        MicroserviceDto result = microserviceService.getById("ms123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("payment-service");
    }

    @Test
    void getById_WithInvalidId_ShouldThrowException() {
        // Given
        when(microserviceRepository.findById("invalid"))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> microserviceService.getById("invalid"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Microservice non trouvé");
    }

    @Test
    void create_WithUniqueName_ShouldCreateMicroservice() {
        // Given
        when(microserviceRepository.findByName("new-service"))
                .thenReturn(Optional.empty());
        when(microserviceRepository.save(any(Microservice.class)))
                .thenReturn(testMicroservice);

        // When
        MicroserviceDto result = microserviceService.create(createRequest);

        // Then
        assertThat(result).isNotNull();
        verify(microserviceRepository).save(argThat(ms -> {
            assertThat(ms.getName()).isEqualTo("new-service");
            assertThat(ms.getSquad()).isEqualTo("Squad 1");
            assertThat(ms.getSolution()).isEqualTo("Core Infrastructure");
            assertThat(ms.getDisplayOrder()).isEqualTo(5);
            assertThat(ms.getIsActive()).isTrue();
            return true;
        }));
    }

    @Test
    void create_WithDuplicateName_ShouldThrowException() {
        // Given
        when(microserviceRepository.findByName("new-service"))
                .thenReturn(Optional.of(testMicroservice));

        // When & Then
        assertThatThrownBy(() -> microserviceService.create(createRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Un microservice avec ce nom existe déjà");
    }

    @Test
    void create_WithNullDisplayOrder_ShouldDefaultToZero() {
        // Given
        createRequest.setDisplayOrder(null);
        when(microserviceRepository.findByName("new-service"))
                .thenReturn(Optional.empty());
        when(microserviceRepository.save(any(Microservice.class)))
                .thenReturn(testMicroservice);

        // When
        microserviceService.create(createRequest);

        // Then
        verify(microserviceRepository).save(argThat(ms -> {
            assertThat(ms.getDisplayOrder()).isEqualTo(0);
            return true;
        }));
    }

    @Test
    void update_WithValidData_ShouldUpdateMicroservice() {
        // Given
        when(microserviceRepository.findById("ms123"))
                .thenReturn(Optional.of(testMicroservice));
        when(microserviceRepository.existsByNameAndIdNot("updated-service", "ms123"))
                .thenReturn(false);
        when(microserviceRepository.save(any(Microservice.class)))
                .thenReturn(testMicroservice);

        // When
        MicroserviceDto result = microserviceService.update("ms123", updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(microserviceRepository).save(argThat(ms -> {
            assertThat(ms.getName()).isEqualTo("updated-service");
            assertThat(ms.getSquad()).isEqualTo("Squad 2");
            assertThat(ms.getSolution()).isEqualTo("Updated Solution");
            assertThat(ms.getDisplayOrder()).isEqualTo(10);
            assertThat(ms.getIsActive()).isFalse();
            return true;
        }));
    }

    @Test
    void update_WithDuplicateName_ShouldThrowException() {
        // Given
        when(microserviceRepository.findById("ms123"))
                .thenReturn(Optional.of(testMicroservice));
        when(microserviceRepository.existsByNameAndIdNot("updated-service", "ms123"))
                .thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> microserviceService.update("ms123", updateRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Un microservice avec ce nom existe déjà");
    }

    @Test
    void update_WithSameName_ShouldNotCheckDuplicate() {
        // Given
        updateRequest.setName("payment-service"); // Same as current name
        when(microserviceRepository.findById("ms123"))
                .thenReturn(Optional.of(testMicroservice));
        when(microserviceRepository.save(any(Microservice.class)))
                .thenReturn(testMicroservice);

        // When
        microserviceService.update("ms123", updateRequest);

        // Then
        verify(microserviceRepository, never()).existsByNameAndIdNot(anyString(), anyString());
    }

    @Test
    void update_WithPartialData_ShouldOnlyUpdateProvidedFields() {
        // Given
        UpdateMicroserviceRequest partialUpdate = new UpdateMicroserviceRequest();
        partialUpdate.setName("new-name");
        // Other fields are null

        when(microserviceRepository.findById("ms123"))
                .thenReturn(Optional.of(testMicroservice));
        when(microserviceRepository.existsByNameAndIdNot("new-name", "ms123"))
                .thenReturn(false);
        when(microserviceRepository.save(any(Microservice.class)))
                .thenReturn(testMicroservice);

        // When
        microserviceService.update("ms123", partialUpdate);

        // Then
        verify(microserviceRepository).save(argThat(ms -> {
            assertThat(ms.getName()).isEqualTo("new-name");
            // Other fields should remain unchanged
            assertThat(ms.getSquad()).isEqualTo("Squad 3");
            assertThat(ms.getSolution()).isEqualTo("Financial Services");
            return true;
        }));
    }

    @Test
    void delete_WithValidId_ShouldSoftDelete() {
        // Given
        when(microserviceRepository.findById("ms123"))
                .thenReturn(Optional.of(testMicroservice));
        when(microserviceRepository.save(any(Microservice.class)))
                .thenReturn(testMicroservice);

        // When
        microserviceService.delete("ms123");

        // Then
        verify(microserviceRepository).save(argThat(ms -> {
            assertThat(ms.getIsActive()).isFalse();
            return true;
        }));
        verify(microserviceRepository, never()).deleteById(any());
    }

    @Test
    void delete_WithInvalidId_ShouldThrowException() {
        // Given
        when(microserviceRepository.findById("invalid"))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> microserviceService.delete("invalid"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Microservice non trouvé");
    }

    @Test
    void hardDelete_WithValidId_ShouldPermanentlyDelete() {
        // Given
        when(microserviceRepository.existsById("ms123")).thenReturn(true);

        // When
        microserviceService.hardDelete("ms123");

        // Then
        verify(microserviceRepository).deleteById("ms123");
    }

    @Test
    void hardDelete_WithInvalidId_ShouldThrowException() {
        // Given
        when(microserviceRepository.existsById("invalid")).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> microserviceService.hardDelete("invalid"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Microservice non trouvé");
    }

    @Test
    void initDefaultMicroservices_WhenDatabaseEmpty_ShouldCreateDefaults() {
        // Given
        when(microserviceRepository.count()).thenReturn(0L);
        when(microserviceRepository.save(any(Microservice.class)))
                .thenReturn(testMicroservice);

        // When
        microserviceService.initDefaultMicroservices();

        // Then
        verify(microserviceRepository, times(13)).save(any(Microservice.class));
    }

    @Test
    void initDefaultMicroservices_WhenDatabaseNotEmpty_ShouldNotCreate() {
        // Given
        when(microserviceRepository.count()).thenReturn(5L);

        // When
        microserviceService.initDefaultMicroservices();

        // Then
        verify(microserviceRepository, never()).save(any(Microservice.class));
    }
}
