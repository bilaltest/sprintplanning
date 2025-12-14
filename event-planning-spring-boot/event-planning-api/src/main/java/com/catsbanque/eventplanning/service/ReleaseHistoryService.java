package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.ReleaseHistoryDto;
import com.catsbanque.eventplanning.entity.Release;
import com.catsbanque.eventplanning.entity.ReleaseHistory;
import com.catsbanque.eventplanning.entity.Squad;
import com.catsbanque.eventplanning.exception.ResourceNotFoundException;
import com.catsbanque.eventplanning.repository.ReleaseHistoryRepository;
import com.catsbanque.eventplanning.repository.ReleaseRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service de gestion de l'historique des releases
 * Référence: release-history.controller.js
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReleaseHistoryService {

    private static final int MAX_HISTORY_ENTRIES = 30;

    private final ReleaseHistoryRepository releaseHistoryRepository;
    private final ReleaseRepository releaseRepository;
    private final ObjectMapper objectMapper;

    /**
     * Archivage automatique : supprimer les entrées au-delà de 30
     * Référence: release-history.controller.js:3-35
     */
    public void archiveReleaseHistory() {
        try {
            long historyCount = releaseHistoryRepository.count();

            // Si on dépasse 30, supprimer les plus anciennes
            if (historyCount > MAX_HISTORY_ENTRIES) {
                int toDelete = (int) (historyCount - MAX_HISTORY_ENTRIES);

                List<ReleaseHistory> entriesToDelete = releaseHistoryRepository
                        .findOldestEntries(toDelete);

                releaseHistoryRepository.deleteAll(entriesToDelete);
                log.info("Archived {} old release history entries", entriesToDelete.size());
            }
        } catch (Exception e) {
            log.error("Error archiving release history", e);
        }
    }

    /**
     * Récupérer l'historique des releases (30 derniers)
     * Référence: release-history.controller.js:37-59
     */
    @Transactional(readOnly = true)
    public List<ReleaseHistoryDto> getReleaseHistory() {
        // Archivage automatique
        archiveReleaseHistory();

        List<ReleaseHistory> history = releaseHistoryRepository.findLast30Entries();

        return history.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Annuler une modification (rollback)
     * Référence: release-history.controller.js:61-127
     */
    @Transactional
    public void rollbackReleaseHistory(String id) {
        ReleaseHistory historyEntry = releaseHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("History entry not found"));

        // Parser les données JSON
        JsonNode releaseData = parseJsonData(historyEntry.getReleaseData());
        JsonNode previousData = parseJsonData(historyEntry.getPreviousData());

        // Logique de rollback selon l'action
        switch (historyEntry.getAction()) {
            case "create":
                // Supprimer la release créée
                if (historyEntry.getReleaseId() != null) {
                    releaseRepository.deleteById(historyEntry.getReleaseId());
                    log.info("Rollback: deleted created release {}", historyEntry.getReleaseId());
                }
                break;

            case "update":
                // Restaurer l'ancienne version
                if (previousData != null && historyEntry.getReleaseId() != null) {
                    Release existingRelease = releaseRepository.findById(historyEntry.getReleaseId())
                            .orElseThrow(() -> new ResourceNotFoundException("Release not found"));

                    // Restore previous data (excluding squads)
                    if (previousData.has("name")) {
                        existingRelease.setName(previousData.get("name").asText());
                    }
                    if (previousData.has("releaseDate")) {
                        existingRelease.setReleaseDate(
                            LocalDateTime.parse(previousData.get("releaseDate").asText())
                        );
                    }
                    if (previousData.has("type")) {
                        existingRelease.setType(previousData.get("type").asText());
                    }
                    if (previousData.has("description")) {
                        String description = previousData.get("description").isNull() ?
                            null : previousData.get("description").asText();
                        existingRelease.setDescription(description);
                    }
                    if (previousData.has("status")) {
                        existingRelease.setStatus(previousData.get("status").asText());
                    }

                    releaseRepository.save(existingRelease);
                    log.info("Rollback: restored release {} to previous state", historyEntry.getReleaseId());
                }
                break;

            case "delete":
                // Re-créer la release supprimée avec 6 squads
                if (previousData != null) {
                    Release newRelease = new Release();

                    if (previousData.has("id")) {
                        newRelease.setId(previousData.get("id").asText());
                    }
                    if (previousData.has("name")) {
                        newRelease.setName(previousData.get("name").asText());
                    }
                    if (previousData.has("releaseDate")) {
                        newRelease.setReleaseDate(
                            LocalDateTime.parse(previousData.get("releaseDate").asText())
                        );
                    }
                    if (previousData.has("type")) {
                        newRelease.setType(previousData.get("type").asText());
                    }
                    if (previousData.has("description")) {
                        String description = previousData.get("description").isNull() ?
                            null : previousData.get("description").asText();
                        newRelease.setDescription(description);
                    }
                    if (previousData.has("status")) {
                        newRelease.setStatus(previousData.get("status").asText());
                    }

                    // Créer 6 squads par défaut
                    List<Squad> squads = new ArrayList<>();
                    for (int i = 1; i <= 6; i++) {
                        Squad squad = new Squad();
                        squad.setSquadNumber(i);
                        squad.setIsCompleted(false);
                        squad.setFeaturesEmptyConfirmed(false);
                        squad.setPreMepEmptyConfirmed(false);
                        squad.setPostMepEmptyConfirmed(false);
                        squad.setRelease(newRelease);
                        squads.add(squad);
                    }
                    newRelease.setSquads(squads);

                    releaseRepository.save(newRelease);
                    log.info("Rollback: recreated deleted release {}", newRelease.getId());
                }
                break;

            default:
                throw new IllegalStateException("Unknown action: " + historyEntry.getAction());
        }

        // Supprimer l'entrée d'historique après rollback réussi
        releaseHistoryRepository.delete(historyEntry);
        log.info("Deleted release history entry after rollback: {}", id);
    }

    /**
     * Vider l'historique
     * Référence: release-history.controller.js:129-137
     */
    @Transactional
    public void clearReleaseHistory() {
        releaseHistoryRepository.deleteAll();
        log.info("Cleared all release history");
    }

    /**
     * Convertir ReleaseHistory en ReleaseHistoryDto avec parsing JSON
     */
    private ReleaseHistoryDto convertToDto(ReleaseHistory history) {
        ReleaseHistoryDto dto = new ReleaseHistoryDto();
        dto.setId(history.getId());
        dto.setAction(history.getAction());
        dto.setReleaseId(history.getReleaseId());
        dto.setUserId(history.getUserId());
        dto.setUserDisplayName(history.getUserDisplayName());
        dto.setTimestamp(history.getTimestamp());

        // Parser les JSON strings
        dto.setReleaseData(parseJsonData(history.getReleaseData()));
        dto.setPreviousData(parseJsonData(history.getPreviousData()));

        return dto;
    }

    /**
     * Parser une chaîne JSON en JsonNode
     */
    private JsonNode parseJsonData(String jsonString) {
        if (jsonString == null || jsonString.isEmpty()) {
            return null;
        }

        try {
            return objectMapper.readTree(jsonString);
        } catch (JsonProcessingException e) {
            log.error("Error parsing JSON data: {}", jsonString, e);
            return null;
        }
    }
}
