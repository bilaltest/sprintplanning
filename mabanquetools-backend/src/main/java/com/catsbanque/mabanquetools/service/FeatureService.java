package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.entity.Feature;
import com.catsbanque.mabanquetools.entity.Squad;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.FeatureRepository;
import com.catsbanque.mabanquetools.repository.SquadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service de gestion des features
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FeatureService {

    private final FeatureRepository featureRepository;
    private final SquadRepository squadRepository;

    /**
     * Créer une nouvelle feature
     */
    @Transactional
    public Feature createFeature(String squadId, CreateFeatureRequest request) {
        // Vérifier que le squad existe
        Squad squad = squadRepository.findById(squadId)
                .orElseThrow(() -> new ResourceNotFoundException("Squad not found"));

        Feature feature = new Feature();
        feature.setSquadId(squadId);
        feature.setTitle(request.getTitle());
        feature.setDescription(request.getDescription());
        feature.setType("major");

        Feature saved = featureRepository.save(feature);
        log.info("Feature created: {} for squad {}", saved.getId(), squadId);
        return saved;
    }

    /**
     * Mettre à jour une feature
     */
    @Transactional
    public Feature updateFeature(String featureId, UpdateFeatureRequest request) {
        Feature feature = featureRepository.findById(featureId)
                .orElseThrow(() -> new ResourceNotFoundException("Feature not found"));

        if (request.getTitle() != null) {
            feature.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            feature.setDescription(request.getDescription());
        }

        Feature updated = featureRepository.save(feature);
        log.info("Feature updated: {}", updated.getId());
        return updated;
    }

    /**
     * Supprimer une feature
     */
    @Transactional
    public void deleteFeature(String featureId) {
        Feature feature = featureRepository.findById(featureId)
                .orElseThrow(() -> new ResourceNotFoundException("Feature not found"));

        featureRepository.delete(feature);
        log.info("Feature deleted: {}", featureId);
    }

    /**
     * DTO pour la création d'une feature
     */
    public static class CreateFeatureRequest {
        private String title;
        private String description;

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
    }

    /**
     * DTO pour la mise à jour d'une feature
     */
    public static class UpdateFeatureRequest {
        private String title;
        private String description;

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
    }
}
