package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.CreateEventRequest;
import com.catsbanque.mabanquetools.dto.EventDto;
import com.catsbanque.mabanquetools.entity.Event;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service de gestion des événements
 * Référence: event.controller.js
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final HistoryService historyService;

    /**
     * Récupérer tous les événements avec filtres optionnels
     * Référence: event.controller.js:32-75
     *
     * Note: L'archivage automatique a été déplacé vers ArchiveScheduler (tâche
     * planifiée à 3h)
     * pour éviter de bloquer les requêtes GET avec des DELETE synchrones
     */
    @Transactional(readOnly = true)
    public List<EventDto> getAllEvents(String category, String dateFrom, String dateTo, String search) {
        // Archivage automatique → Déplacé vers ArchiveScheduler.archiveOldEvents()

        List<Event> events;

        if (search != null && !search.isEmpty()) {
            events = eventRepository.searchByTitleOrDescription(search);
        } else if (dateFrom != null && dateTo != null) {
            events = eventRepository.findByDateBetween(dateFrom, dateTo);
        } else if (dateFrom != null) {
            events = eventRepository.findByDateAfter(dateFrom);
        } else if (dateTo != null) {
            events = eventRepository.findByDateBefore(dateTo);
        } else if (category != null) {
            events = eventRepository.findByCategory(category);
        } else {
            events = eventRepository.findAll();
        }

        // Si category est spécifié avec d'autres filtres
        if (category != null && search == null) {
            events = events.stream()
                    .filter(e -> category.equals(e.getCategory()))
                    .collect(Collectors.toList());
        }

        return events.stream()
                .map(EventDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer un événement par ID
     * Référence: event.controller.js:78-94
     */
    @Transactional(readOnly = true)
    public EventDto getEventById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        return EventDto.fromEntity(event);
    }

    /**
     * Créer un nouvel événement
     * Référence: event.controller.js:97-146
     */
    @Transactional
    public EventDto createEvent(CreateEventRequest request, String userId) {
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDate(request.getDate());
        event.setEndDate(request.getEndDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setColor(request.getColor());
        event.setIcon(request.getIcon());
        event.setCategory(request.getCategory());
        event.setDescription(request.getDescription());

        Event saved = eventRepository.save(event);

        // Enregistrer dans l'historique
        // Enregistrer dans l'historique
        historyService.createEntry("create", saved, null, userId);

        log.info("Event created: {}", saved.getId());
        return EventDto.fromEntity(saved);
    }

    /**
     * Mettre à jour un événement
     * Référence: event.controller.js:149-207
     */
    @Transactional
    public EventDto updateEvent(String id, CreateEventRequest request, String userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        // Sauvegarder l'ancien état pour l'historique
        Event oldEvent = cloneEvent(event);

        // Mettre à jour
        event.setTitle(request.getTitle());
        event.setDate(request.getDate());
        event.setEndDate(request.getEndDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setColor(request.getColor());
        event.setIcon(request.getIcon());
        event.setCategory(request.getCategory());
        event.setDescription(request.getDescription());

        Event updated = eventRepository.save(event);

        // Enregistrer dans l'historique
        // Enregistrer dans l'historique
        historyService.createEntry("update", updated, oldEvent, userId);

        log.info("Event updated: {}", updated.getId());
        return EventDto.fromEntity(updated);
    }

    /**
     * Supprimer un événement
     * Référence: event.controller.js:210-249
     */
    @Transactional
    public void deleteEvent(String id, String userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        eventRepository.delete(event);

        // Enregistrer dans l'historique
        // Enregistrer dans l'historique
        historyService.createEntry("delete", null, event, userId);

        log.info("Event deleted: {}", id);
    }

    /**
     * Supprimer tous les événements
     * Référence: event.controller.js:252-259
     */
    @Transactional
    public void deleteAllEvents() {
        eventRepository.deleteAll();
        log.info("All events deleted");
    }

    /**
     * Créer plusieurs événements (pour import)
     * Référence: event.controller.js:262-279
     */
    @Transactional
    public int bulkCreateEvents(List<CreateEventRequest> events) {
        int count = 0;
        for (CreateEventRequest request : events) {
            try {
                Event event = new Event();
                event.setTitle(request.getTitle());
                event.setDate(request.getDate());
                event.setEndDate(request.getEndDate());
                event.setStartTime(request.getStartTime());
                event.setEndTime(request.getEndTime());
                event.setColor(request.getColor());
                event.setIcon(request.getIcon());
                event.setCategory(request.getCategory());
                event.setDescription(request.getDescription());

                eventRepository.save(event);
                count++;
            } catch (Exception e) {
                log.warn("Failed to create event: {}", request.getTitle(), e);
            }
        }
        log.info("Bulk created {} events", count);
        return count;
    }

    /**
     * Créer une entrée d'historique
     * Référence: event.controller.js:131-140, 192-201, 234-243
     */

    /**
     * Cloner un événement pour l'historique
     */
    private Event cloneEvent(Event event) {
        Event clone = new Event();
        clone.setId(event.getId());
        clone.setTitle(event.getTitle());
        clone.setDate(event.getDate());
        clone.setEndDate(event.getEndDate());
        clone.setStartTime(event.getStartTime());
        clone.setEndTime(event.getEndTime());
        clone.setColor(event.getColor());
        clone.setIcon(event.getIcon());
        clone.setCategory(event.getCategory());
        clone.setDescription(event.getDescription());
        clone.setCreatedAt(event.getCreatedAt());
        clone.setUpdatedAt(event.getUpdatedAt());
        return clone;
    }
}
