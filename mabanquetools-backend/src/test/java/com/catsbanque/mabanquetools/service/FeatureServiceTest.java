package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.entity.Feature;
import com.catsbanque.mabanquetools.entity.Squad;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.FeatureRepository;
import com.catsbanque.mabanquetools.repository.SquadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FeatureService - Unit Tests")
class FeatureServiceTest {

    @Mock
    private FeatureRepository featureRepository;

    @Mock
    private SquadRepository squadRepository;

    @InjectMocks
    private FeatureService featureService;

    private Squad testSquad;
    private Feature testFeature;

    @BeforeEach
    void setUp() {
        testSquad = new Squad();
        testSquad.setId("squad-1");

        testFeature = new Feature();
        testFeature.setId("feature-1");
        testFeature.setSquadId("squad-1");
        testFeature.setTitle("Test Feature");
    }

    @Test
    @DisplayName("createFeature - Success")
    void testCreateFeature_Success() {
        // Given
        FeatureService.CreateFeatureRequest request = new FeatureService.CreateFeatureRequest();
        request.setTitle("New Feature");
        request.setDescription("Desc");

        when(squadRepository.findById("squad-1")).thenReturn(Optional.of(testSquad));
        when(featureRepository.save(any(Feature.class))).thenAnswer(i -> {
            Feature f = i.getArgument(0);
            f.setId("feature-new");
            return f;
        });

        // When
        Feature result = featureService.createFeature("squad-1", request);

        // Then
        assertNotNull(result);
        assertEquals("feature-new", result.getId());
        assertEquals("New Feature", result.getTitle());
    }

    @Test
    @DisplayName("createFeature - Squad Not Found")
    void testCreateFeature_SquadNotFound() {
        // Given
        when(squadRepository.findById("unknown")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> featureService.createFeature("unknown", new FeatureService.CreateFeatureRequest()));
    }

    @Test
    @DisplayName("updateFeature - Success")
    void testUpdateFeature_Success() {
        // Given
        FeatureService.UpdateFeatureRequest request = new FeatureService.UpdateFeatureRequest();
        request.setTitle("Updated Title");

        when(featureRepository.findById("feature-1")).thenReturn(Optional.of(testFeature));
        when(featureRepository.save(any(Feature.class))).thenAnswer(i -> i.getArgument(0));

        // When
        Feature result = featureService.updateFeature("feature-1", request);

        // Then
        assertEquals("Updated Title", result.getTitle());
        verify(featureRepository).save(testFeature);
    }

    @Test
    @DisplayName("deleteFeature - Success")
    void testDeleteFeature_Success() {
        // Given
        when(featureRepository.findById("feature-1")).thenReturn(Optional.of(testFeature));

        // When
        featureService.deleteFeature("feature-1");

        // Then
        verify(featureRepository).delete(testFeature);
    }
}
