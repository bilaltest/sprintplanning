package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.entity.Squad;
import com.catsbanque.eventplanning.exception.ResourceNotFoundException;
import com.catsbanque.eventplanning.repository.SquadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SquadServiceTest {

    @Mock
    private SquadRepository squadRepository;

    @InjectMocks
    private SquadService squadService;

    private Squad testSquad;
    private SquadService.UpdateSquadRequest updateRequest;

    @BeforeEach
    void setUp() {
        testSquad = new Squad();
        testSquad.setId("squad123");
        testSquad.setSquadNumber(1);
        testSquad.setTontonMep("John Doe");
        testSquad.setIsCompleted(false);
        testSquad.setFeaturesEmptyConfirmed(false);
        testSquad.setPreMepEmptyConfirmed(false);
        testSquad.setPostMepEmptyConfirmed(false);

        updateRequest = new SquadService.UpdateSquadRequest();
        updateRequest.setTontonMep("Jane Smith");
        updateRequest.setIsCompleted(true);
        updateRequest.setFeaturesEmptyConfirmed(true);
        updateRequest.setPreMepEmptyConfirmed(true);
        updateRequest.setPostMepEmptyConfirmed(true);
    }

    @Test
    void updateSquad_WithAllFields_ShouldUpdateSquad() {
        // Given
        when(squadRepository.findById("squad123")).thenReturn(Optional.of(testSquad));
        when(squadRepository.save(any(Squad.class))).thenReturn(testSquad);

        // When
        Squad result = squadService.updateSquad("squad123", updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(squadRepository).save(argThat(squad -> {
            assertThat(squad.getTontonMep()).isEqualTo("Jane Smith");
            assertThat(squad.getIsCompleted()).isTrue();
            assertThat(squad.getFeaturesEmptyConfirmed()).isTrue();
            assertThat(squad.getPreMepEmptyConfirmed()).isTrue();
            assertThat(squad.getPostMepEmptyConfirmed()).isTrue();
            return true;
        }));
    }

    @Test
    void updateSquad_WithPartialFields_ShouldUpdateOnlyProvidedFields() {
        // Given
        SquadService.UpdateSquadRequest partialRequest = new SquadService.UpdateSquadRequest();
        partialRequest.setTontonMep("New Tonton");
        // Other fields are null

        when(squadRepository.findById("squad123")).thenReturn(Optional.of(testSquad));
        when(squadRepository.save(any(Squad.class))).thenReturn(testSquad);

        // When
        Squad result = squadService.updateSquad("squad123", partialRequest);

        // Then
        assertThat(result).isNotNull();
        verify(squadRepository).save(argThat(squad -> {
            assertThat(squad.getTontonMep()).isEqualTo("New Tonton");
            // Other fields should remain unchanged
            assertThat(squad.getIsCompleted()).isFalse();
            assertThat(squad.getFeaturesEmptyConfirmed()).isFalse();
            return true;
        }));
    }

    @Test
    void updateSquad_WithOnlyTontonMep_ShouldUpdateOnlyTontonMep() {
        // Given
        SquadService.UpdateSquadRequest request = new SquadService.UpdateSquadRequest();
        request.setTontonMep("Updated Tonton");

        when(squadRepository.findById("squad123")).thenReturn(Optional.of(testSquad));
        when(squadRepository.save(any(Squad.class))).thenReturn(testSquad);

        // When
        squadService.updateSquad("squad123", request);

        // Then
        verify(squadRepository).save(argThat(squad -> {
            assertThat(squad.getTontonMep()).isEqualTo("Updated Tonton");
            assertThat(squad.getIsCompleted()).isFalse();
            return true;
        }));
    }

    @Test
    void updateSquad_WithOnlyIsCompleted_ShouldUpdateOnlyIsCompleted() {
        // Given
        SquadService.UpdateSquadRequest request = new SquadService.UpdateSquadRequest();
        request.setIsCompleted(true);

        when(squadRepository.findById("squad123")).thenReturn(Optional.of(testSquad));
        when(squadRepository.save(any(Squad.class))).thenReturn(testSquad);

        // When
        squadService.updateSquad("squad123", request);

        // Then
        verify(squadRepository).save(argThat(squad -> {
            assertThat(squad.getIsCompleted()).isTrue();
            assertThat(squad.getTontonMep()).isEqualTo("John Doe");
            return true;
        }));
    }

    @Test
    void updateSquad_WithOnlyFeaturesEmptyConfirmed_ShouldUpdateOnlyFeaturesEmptyConfirmed() {
        // Given
        SquadService.UpdateSquadRequest request = new SquadService.UpdateSquadRequest();
        request.setFeaturesEmptyConfirmed(true);

        when(squadRepository.findById("squad123")).thenReturn(Optional.of(testSquad));
        when(squadRepository.save(any(Squad.class))).thenReturn(testSquad);

        // When
        squadService.updateSquad("squad123", request);

        // Then
        verify(squadRepository).save(argThat(squad -> {
            assertThat(squad.getFeaturesEmptyConfirmed()).isTrue();
            return true;
        }));
    }

    @Test
    void updateSquad_WithOnlyPreMepEmptyConfirmed_ShouldUpdateOnlyPreMepEmptyConfirmed() {
        // Given
        SquadService.UpdateSquadRequest request = new SquadService.UpdateSquadRequest();
        request.setPreMepEmptyConfirmed(true);

        when(squadRepository.findById("squad123")).thenReturn(Optional.of(testSquad));
        when(squadRepository.save(any(Squad.class))).thenReturn(testSquad);

        // When
        squadService.updateSquad("squad123", request);

        // Then
        verify(squadRepository).save(argThat(squad -> {
            assertThat(squad.getPreMepEmptyConfirmed()).isTrue();
            return true;
        }));
    }

    @Test
    void updateSquad_WithOnlyPostMepEmptyConfirmed_ShouldUpdateOnlyPostMepEmptyConfirmed() {
        // Given
        SquadService.UpdateSquadRequest request = new SquadService.UpdateSquadRequest();
        request.setPostMepEmptyConfirmed(true);

        when(squadRepository.findById("squad123")).thenReturn(Optional.of(testSquad));
        when(squadRepository.save(any(Squad.class))).thenReturn(testSquad);

        // When
        squadService.updateSquad("squad123", request);

        // Then
        verify(squadRepository).save(argThat(squad -> {
            assertThat(squad.getPostMepEmptyConfirmed()).isTrue();
            return true;
        }));
    }

    @Test
    void updateSquad_WithInvalidId_ShouldThrowException() {
        // Given
        when(squadRepository.findById("invalid")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> squadService.updateSquad("invalid", updateRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Squad not found");
    }

    @Test
    void updateSquad_WithEmptyRequest_ShouldNotUpdateAnyField() {
        // Given
        SquadService.UpdateSquadRequest emptyRequest = new SquadService.UpdateSquadRequest();

        when(squadRepository.findById("squad123")).thenReturn(Optional.of(testSquad));
        when(squadRepository.save(any(Squad.class))).thenReturn(testSquad);

        // When
        squadService.updateSquad("squad123", emptyRequest);

        // Then
        verify(squadRepository).save(argThat(squad -> {
            assertThat(squad.getTontonMep()).isEqualTo("John Doe");
            assertThat(squad.getIsCompleted()).isFalse();
            assertThat(squad.getFeaturesEmptyConfirmed()).isFalse();
            assertThat(squad.getPreMepEmptyConfirmed()).isFalse();
            assertThat(squad.getPostMepEmptyConfirmed()).isFalse();
            return true;
        }));
    }

    @Test
    void updateSquad_ShouldReturnUpdatedSquad() {
        // Given
        when(squadRepository.findById("squad123")).thenReturn(Optional.of(testSquad));

        Squad updatedSquad = new Squad();
        updatedSquad.setId("squad123");
        updatedSquad.setTontonMep("Jane Smith");
        updatedSquad.setIsCompleted(true);

        when(squadRepository.save(any(Squad.class))).thenReturn(updatedSquad);

        // When
        Squad result = squadService.updateSquad("squad123", updateRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTontonMep()).isEqualTo("Jane Smith");
        assertThat(result.getIsCompleted()).isTrue();
    }
}
