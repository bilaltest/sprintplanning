package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.HistoryDto;
import com.catsbanque.mabanquetools.entity.Event;
import com.catsbanque.mabanquetools.entity.History;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.EventRepository;
import com.catsbanque.mabanquetools.repository.HistoryRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service de gestion de l'historique des événements
 * Référence: history.controller.js
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HistoryService {

    private static final int MAX_HISTORY_ENTRIES = 30;

    private final HistoryRepository historyRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository; // Added injection
    private final ObjectMapper objectMapper;

    /**
     * Archivage automatique : supprimer les entrées au-delà de 30
     */
    public void archiveHistory() {
        try {
            long historyCount = historyRepository.count();

            // Si on dépasse 30, supprimer les plus anciennes
            if (historyCount > MAX_HISTORY_ENTRIES) {
                int toDelete = (int) (historyCount - MAX_HISTORY_ENTRIES);

                List<History> entriesToDelete = historyRepository
                        .findOldestEntries(toDelete);

                historyRepository.deleteAll(entriesToDelete);
                log.info("Archived {} old history entries", entriesToDelete.size());
            }
        } catch (Exception e) {
            log.error("Error archiving history", e);
        }
    }

    /**
     * Créer une entrée d'historique
     * Centralise la logique de création et déclenche l'archivage
     */
    @Transactional
    public void createEntry(String action, Event newEvent, Event oldEvent, String userId) {
        try {
            History history = new History();
            history.setAction(action);

            if (newEvent != null) {
                history.setEventId(newEvent.getId());
                history.setEventData(objectMapper
                        .writeValueAsString(com.catsbanque.mabanquetools.dto.EventDto.fromEntity(newEvent)));
            } else if (oldEvent != null) {
                history.setEventId(oldEvent.getId());
                history.setEventData("null");
            }

            if (oldEvent != null) {
                history.setPreviousData(objectMapper
                        .writeValueAsString(com.catsbanque.mabanquetools.dto.EventDto.fromEntity(oldEvent)));
            }

            if (userId != null) {
                history.setUserId(userId);
                userRepository.findById(userId).ifPresent(user -> {
                    String displayName = user.getFirstName() + " " + user.getLastName();
                    history.setUserDisplayName(displayName);
                });
            }

            historyRepository.save(history);

            // Nettoyer l'historique après ajout
            archiveHistory();

        } catch (JsonProcessingException e) {
            log.error("Failed to create history entry", e);
        }
    }

    /**
     * Récupérer l'historique (30 derniers)
     * Note: Ne fait plus d'archivage à la lecture (évite les boucles
     * transactionnelles)
     */
    @Transactional(readOnly = true)
    public List<HistoryDto> getHistory() {
        List<History> history = historyRepository.findLast30Entries();

        return history.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Annuler une modification (rollback)
     * Référence: history.controller.js:61-106
     */
    @Transactional
    public void rollbackHistory(String id) {
        History historyEntry = historyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("History entry not found"));

        // Parser les données JSON
        Event previousData = parseEventData(historyEntry.getPreviousData());

        // Logique de rollback selon l'action
        switch (historyEntry.getAction()) {
            case "create":
                // Supprimer l'événement créé
                if (historyEntry.getEventId() != null) {
                    eventRepository.deleteById(historyEntry.getEventId());
                    log.info("Rollback: deleted created event {}", historyEntry.getEventId());
                }
                break;

            case "update":
                // Restaurer l'ancienne version
                if (previousData != null && historyEntry.getEventId() != null) {
                    Event existingEvent = eventRepository.findById(historyEntry.getEventId())
                            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

                    // Restore previous data
                    existingEvent.setTitle(previousData.getTitle());
                    existingEvent.setDate(previousData.getDate());
                    existingEvent.setStartTime(previousData.getStartTime());
                    existingEvent.setEndTime(previousData.getEndTime());
                    existingEvent.setColor(previousData.getColor());
                    existingEvent.setIcon(previousData.getIcon());
                    existingEvent.setCategory(previousData.getCategory());
                    existingEvent.setDescription(previousData.getDescription());

                    eventRepository.save(existingEvent);
                    log.info("Rollback: restored event {} to previous state", historyEntry.getEventId());
                }
                break;

            case "delete":
                // Re-créer l'événement supprimé
                if (previousData != null) {
                    eventRepository.save(previousData);
                    log.info("Rollback: recreated deleted event {}", previousData.getId());
                }
                break;

            default:
                throw new IllegalStateException("Unknown action: " + historyEntry.getAction());
        }

        // Supprimer l'entrée d'historique après rollback réussi
        historyRepository.delete(historyEntry);
        log.info("Deleted history entry after rollback: {}", id);
    }

    /**
     * Vider l'historique
     * Référence: history.controller.js:108-116
     */
    @Transactional
    public void clearHistory() {
        historyRepository.deleteAll();
        log.info("Cleared all history");
    }

    /**
     * Convertir History en HistoryDto avec parsing JSON
     */
    private HistoryDto convertToDto(History history) {
        HistoryDto dto = new HistoryDto();
        dto.setId(history.getId());
        dto.setAction(history.getAction());
        dto.setEventId(history.getEventId());
        dto.setUserId(history.getUserId());
        dto.setUserDisplayName(history.getUserDisplayName());
        dto.setTimestamp(history.getTimestamp());

        // Parser les JSON strings
        dto.setEventData(parseEventData(history.getEventData()));
        dto.setPreviousData(parseEventData(history.getPreviousData()));

        return dto;
    }

    /**
     * Parser une chaîne JSON en objet Event
     */
    private Event parseEventData(String jsonString) {
        if (jsonString == null || jsonString.isEmpty()) {
            return null;
        }

        try {
            return objectMapper.readValue(jsonString, Event.class);
        } catch (JsonProcessingException e) {
            log.error("Error parsing event data: {}", jsonString, e);
            return null;
        }
    }
}
