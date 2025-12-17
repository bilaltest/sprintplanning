package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.FeatureFlippingDto;
import com.catsbanque.eventplanning.entity.Action;
import com.catsbanque.eventplanning.entity.FeatureFlipping;
import com.catsbanque.eventplanning.entity.Squad;
import com.catsbanque.eventplanning.exception.ResourceNotFoundException;
import com.catsbanque.eventplanning.repository.ActionRepository;
import com.catsbanque.eventplanning.repository.SquadRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
    private static final java.util.Random random = new java.security.SecureRandom();

    /**
     * Créer une nouvelle action
     */
    @Transactional
    public Action createAction(String squadId, CreateActionRequest request) {
        // Vérifier que le squad existe
        Squad squad = squadRepository.findById(squadId)
                .orElseThrow(() -> new ResourceNotFoundException("Squad not found"));

        Action action = new Action();
        action.setId(generateCuid()); // Generate ID immediately to link FeatureFlipping
        action.setSquadId(squadId);
        action.setPhase(request.getPhase());
        action.setType(request.getType());
        action.setTitle(request.getTitle());
        action.setDescription(request.getDescription());
        action.setStatus(request.getStatus() != null ? request.getStatus() : "pending");
        action.setOrder(request.getOrder() != null ? request.getOrder() : 0);

        if (request.getFlipping() != null) {
            FeatureFlipping flipping = mapToEntity(request.getFlipping());
            flipping.setActionId(action.getId()); // Manually set FK
            flipping.setAction(action);
            action.setFlipping(flipping);
        }

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

        if (request.getFlipping() != null) {
            FeatureFlipping flipping = action.getFlipping();
            if (flipping == null) {
                flipping = new FeatureFlipping();
                flipping.setActionId(action.getId()); // Manually set FK for new entity
                flipping.setAction(action);
                action.setFlipping(flipping);
            }
            updateFlippingEntity(flipping, request.getFlipping());
        }

        Action updated = actionRepository.save(action);
        log.info("Action updated: {} (status: {})", updated.getId(), updated.getStatus());
        return updated;
    }

    private FeatureFlipping mapToEntity(FeatureFlippingDto dto) {
        FeatureFlipping entity = new FeatureFlipping();
        updateFlippingEntity(entity, dto);
        return entity;
    }

    private void updateFlippingEntity(FeatureFlipping entity, FeatureFlippingDto dto) {
        entity.setFlippingType(dto.getFlippingType());
        entity.setRuleName(dto.getRuleName());
        entity.setTheme(dto.getTheme());
        entity.setRuleAction(dto.getRuleAction());
        entity.setRuleState(dto.getRuleState());
        entity.setTargetCaisses(dto.getTargetCaisses());

        try {
            entity.setTargetClients(objectMapper.writeValueAsString(dto.getTargetClients()));
            entity.setTargetOS(objectMapper.writeValueAsString(dto.getTargetOS()));
            entity.setTargetVersions(objectMapper.writeValueAsString(dto.getTargetVersions()));
        } catch (JsonProcessingException e) {
            log.error("Error serializing flipping targets", e);
            throw new RuntimeException("Error serializing flipping targets", e);
        }
    }

    private String generateCuid() {
        long timestamp = System.currentTimeMillis();
        StringBuilder cuid = new StringBuilder("c");
        cuid.append(Long.toString(timestamp, 36));
        for (int i = 0; i < 8; i++) {
            cuid.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return cuid.toString();
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
        private FeatureFlippingDto flipping;

        public String getPhase() {
            return phase;
        }

        public void setPhase(String phase) {
            this.phase = phase;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getOrder() {
            return order;
        }

        public void setOrder(Integer order) {
            this.order = order;
        }

        public FeatureFlippingDto getFlipping() {
            return flipping;
        }

        public void setFlipping(FeatureFlippingDto flipping) {
            this.flipping = flipping;
        }
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
        private FeatureFlippingDto flipping;

        public String getPhase() {
            return phase;
        }

        public void setPhase(String phase) {
            this.phase = phase;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getOrder() {
            return order;
        }

        public void setOrder(Integer order) {
            this.order = order;
        }

        public FeatureFlippingDto getFlipping() {
            return flipping;
        }

        public void setFlipping(FeatureFlippingDto flipping) {
            this.flipping = flipping;
        }
    }
}
