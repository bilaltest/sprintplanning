package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.FeatureFlippingDto;
import com.catsbanque.mabanquetools.entity.Action;
import com.catsbanque.mabanquetools.entity.FeatureFlipping;
import com.catsbanque.mabanquetools.entity.Squad;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.ActionRepository;
import com.catsbanque.mabanquetools.repository.SquadRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ActionService - Unit Tests")
class ActionServiceTest {

    @Mock
    private ActionRepository actionRepository;

    @Mock
    private SquadRepository squadRepository;

    // Use real ObjectMapper logic inside service (it instantiates its own),
    // or we can test the outcome of serialization indirectly via saved entity
    // fields if we can't inject.
    // The service `ActionService` creates `new ObjectMapper()` in its field
    // declaration, so we can't easily mock it without setter or constructor
    // injection change.
    // However, for unit tests of logic, checking that correct strings are produced
    // is fine.

    @InjectMocks
    private ActionService actionService;

    private Squad testSquad;
    private Action testAction;

    @BeforeEach
    void setUp() {
        testSquad = new Squad();
        testSquad.setId("squad-1");

        testAction = new Action();
        testAction.setId("action-1");
        testAction.setSquadId("squad-1");
        testAction.setTitle("Test Action");
    }

    @Test
    @DisplayName("createAction - Success with Flipping")
    void testCreateAction_Success() {
        // Given
        ActionService.CreateActionRequest request = new ActionService.CreateActionRequest();
        request.setTitle("New Feature");
        request.setPhase("run");
        request.setType("backend");

        FeatureFlippingDto flippingDto = new FeatureFlippingDto();
        flippingDto.setRuleName("RULE_1");
        flippingDto.setTargetCaisses("123,456");
        flippingDto.setTargetClients(List.of("10", "20")); // List

        request.setFlipping(flippingDto);

        when(squadRepository.findById("squad-1")).thenReturn(Optional.of(testSquad));
        when(actionRepository.save(any(Action.class))).thenAnswer(i -> i.getArgument(0));

        // When
        Action result = actionService.createAction("squad-1", request);

        // Then
        assertNotNull(result.getId());
        assertEquals("New Feature", result.getTitle());
        assertNotNull(result.getFlipping());
        assertEquals("RULE_1", result.getFlipping().getRuleName());
        // Verify JSON serialization happened (implicit check via value presence)
        assertTrue(result.getFlipping().getTargetClients().contains("10"));
    }

    @Test
    @DisplayName("createAction - Squad Not Found")
    void testCreateAction_SquadNotFound() {
        // Given
        when(squadRepository.findById("unknown")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> actionService.createAction("unknown", new ActionService.CreateActionRequest()));
    }

    @Test
    @DisplayName("updateAction - Success Partial Update")
    void testUpdateAction_Success() {
        // Given
        ActionService.UpdateActionRequest request = new ActionService.UpdateActionRequest();
        request.setStatus("completed");

        when(actionRepository.findById("action-1")).thenReturn(Optional.of(testAction));
        when(actionRepository.save(any(Action.class))).thenAnswer(i -> i.getArgument(0));

        // When
        Action result = actionService.updateAction("action-1", request);

        // Then
        assertEquals("completed", result.getStatus());
        verify(actionRepository).save(testAction);
    }

    @Test
    @DisplayName("updateAction - Add Flipping to Existing Action")
    void testUpdateAction_AddFlipping() {
        // Given
        ActionService.UpdateActionRequest request = new ActionService.UpdateActionRequest();
        FeatureFlippingDto flippingDto = new FeatureFlippingDto();
        flippingDto.setRuleName("RULE_UPDATE");
        request.setFlipping(flippingDto);

        // Action initially has no flipping
        testAction.setFlipping(null);

        when(actionRepository.findById("action-1")).thenReturn(Optional.of(testAction));
        when(actionRepository.save(any(Action.class))).thenAnswer(i -> i.getArgument(0));

        // When
        Action result = actionService.updateAction("action-1", request);

        // Then
        assertNotNull(result.getFlipping());
        assertEquals("RULE_UPDATE", result.getFlipping().getRuleName());
        assertEquals("action-1", result.getFlipping().getActionId());
    }

    @Test
    @DisplayName("deleteAction - Success")
    void testDeleteAction_Success() {
        // Given
        when(actionRepository.findById("action-1")).thenReturn(Optional.of(testAction));

        // When
        actionService.deleteAction("action-1");

        // Then
        verify(actionRepository).delete(testAction);
    }
}
