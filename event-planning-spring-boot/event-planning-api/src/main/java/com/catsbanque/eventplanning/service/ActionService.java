package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.entity.Action;
import com.catsbanque.eventplanning.entity.Squad;
import com.catsbanque.eventplanning.exception.ResourceNotFoundException;
import com.catsbanque.eventplanning.repository.ActionRepository;
import com.catsbanque.eventplanning.repository.SquadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service de gestion des actions
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionService {

    private final ActionRepository actionRepository;
    private final SquadRepository squadRepository;

    /**
     * Créer une nouvelle action
     */
    @Transactional
    public Action createAction(String squadId, CreateActionRequest request) {
        // Vérifier que le squad existe
        Squad squad = squadRepository.findById(squadId)
                .orElseThrow(() -> new ResourceNotFoundException("Squad not found"));

        Action action = new Action();
        action.setSquadId(squadId);
        action.setPhase(request.getPhase());
        action.setType(request.getType());
        action.setTitle(request.getTitle());
        action.setDescription(request.getDescription());
        action.setStatus(request.getStatus() != null ? request.getStatus() : "pending");
        action.setOrder(request.getOrder() != null ? request.getOrder() : 0);

        Action saved = actionRepository.save(action);
        log.info("Action created: {} for squad {}", saved.getId(), squadId);
        return saved;
    }

    /**
     * Mettre à jour une action
     */
    @Transactional
    public Action updateAction(String actionId, UpdateActionRequest request) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new ResourceNotFoundException("Action not found"));

        if (request.getPhase() != null) {
            action.setPhase(request.getPhase());
        }
        if (request.getType() != null) {
            action.setType(request.getType());
        }
        if (request.getTitle() != null) {
            action.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            action.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            action.setStatus(request.getStatus());
        }
        if (request.getOrder() != null) {
            action.setOrder(request.getOrder());
        }

        Action updated = actionRepository.save(action);
        log.info("Action updated: {} (status: {})", updated.getId(), updated.getStatus());
        return updated;
    }

    /**
     * Supprimer une action
     */
    @Transactional
    public void deleteAction(String actionId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new ResourceNotFoundException("Action not found"));

        actionRepository.delete(action);
        log.info("Action deleted: {}", actionId);
    }

    /**
     * DTO pour la création d'une action
     */
    public static class CreateActionRequest {
        private String phase;
        private String type;
        private String title;
        private String description;
        private String status;
        private Integer order;

        public String getPhase() { return phase; }
        public void setPhase(String phase) { this.phase = phase; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Integer getOrder() { return order; }
        public void setOrder(Integer order) { this.order = order; }
    }

    /**
     * DTO pour la mise à jour d'une action
     */
    public static class UpdateActionRequest {
        private String phase;
        private String type;
        private String title;
        private String description;
        private String status;
        private Integer order;

        public String getPhase() { return phase; }
        public void setPhase(String phase) { this.phase = phase; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Integer getOrder() { return order; }
        public void setOrder(Integer order) { this.order = order; }
    }
}
