package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.entity.Squad;
import com.catsbanque.eventplanning.exception.ResourceNotFoundException;
import com.catsbanque.eventplanning.repository.SquadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service de gestion des squads
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SquadService {

    private final SquadRepository squadRepository;

    /**
     * Mettre à jour un squad
     */
    @Transactional
    public Squad updateSquad(String squadId, UpdateSquadRequest request) {
        Squad squad = squadRepository.findById(squadId)
                .orElseThrow(() -> new ResourceNotFoundException("Squad not found"));

        // Mettre à jour les champs fournis
        if (request.getTontonMep() != null) {
            squad.setTontonMep(request.getTontonMep());
        }
        if (request.getIsCompleted() != null) {
            squad.setIsCompleted(request.getIsCompleted());
        }
        if (request.getFeaturesEmptyConfirmed() != null) {
            squad.setFeaturesEmptyConfirmed(request.getFeaturesEmptyConfirmed());
        }
        if (request.getPreMepEmptyConfirmed() != null) {
            squad.setPreMepEmptyConfirmed(request.getPreMepEmptyConfirmed());
        }
        if (request.getPostMepEmptyConfirmed() != null) {
            squad.setPostMepEmptyConfirmed(request.getPostMepEmptyConfirmed());
        }

        Squad updated = squadRepository.save(squad);
        log.info("Squad updated: {} (tontonMep: {})", updated.getId(), updated.getTontonMep());
        return updated;
    }

    /**
     * DTO pour la mise à jour d'un squad
     */
    public static class UpdateSquadRequest {
        private String tontonMep;
        private Boolean isCompleted;
        private Boolean featuresEmptyConfirmed;
        private Boolean preMepEmptyConfirmed;
        private Boolean postMepEmptyConfirmed;

        public String getTontonMep() { return tontonMep; }
        public void setTontonMep(String tontonMep) { this.tontonMep = tontonMep; }

        public Boolean getIsCompleted() { return isCompleted; }
        public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }

        public Boolean getFeaturesEmptyConfirmed() { return featuresEmptyConfirmed; }
        public void setFeaturesEmptyConfirmed(Boolean featuresEmptyConfirmed) { this.featuresEmptyConfirmed = featuresEmptyConfirmed; }

        public Boolean getPreMepEmptyConfirmed() { return preMepEmptyConfirmed; }
        public void setPreMepEmptyConfirmed(Boolean preMepEmptyConfirmed) { this.preMepEmptyConfirmed = preMepEmptyConfirmed; }

        public Boolean getPostMepEmptyConfirmed() { return postMepEmptyConfirmed; }
        public void setPostMepEmptyConfirmed(Boolean postMepEmptyConfirmed) { this.postMepEmptyConfirmed = postMepEmptyConfirmed; }
    }
}
