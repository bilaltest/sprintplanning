package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.dto.CreateEventRequest;
import com.catsbanque.eventplanning.dto.EventDto;
import com.catsbanque.eventplanning.service.EventService;
import com.catsbanque.eventplanning.util.TokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour les événements
 * Endpoints identiques à Node.js (event.routes.js)
 */
@Slf4j
@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    /**
     * GET /api/events
     * Récupérer tous les événements avec filtres optionnels
     */
    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) String search
    ) {
        log.info("GET /api/events - category: {}, dateFrom: {}, dateTo: {}, search: {}",
                category, dateFrom, dateTo, search);
        List<EventDto> events = eventService.getAllEvents(category, dateFrom, dateTo, search);
        return ResponseEntity.ok(events);
    }

    /**
     * GET /api/events/:id
     * Récupérer un événement par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable String id) {
        log.info("GET /api/events/{}", id);
        EventDto event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    /**
     * POST /api/events
     * Créer un nouvel événement
     */
    @PostMapping
    public ResponseEntity<EventDto> createEvent(
            @Valid @RequestBody CreateEventRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("POST /api/events - title: {}", request.getTitle());
        String userId = TokenUtil.extractUserIdFromRequest(httpRequest).orElse(null);
        EventDto event = eventService.createEvent(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    /**
     * PUT /api/events/:id
     * Mettre à jour un événement
     */
    @PutMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(
            @PathVariable String id,
            @Valid @RequestBody CreateEventRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("PUT /api/events/{} - title: {}", id, request.getTitle());
        String userId = TokenUtil.extractUserIdFromRequest(httpRequest).orElse(null);
        EventDto event = eventService.updateEvent(id, request, userId);
        return ResponseEntity.ok(event);
    }

    /**
     * DELETE /api/events/:id
     * Supprimer un événement
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable String id,
            HttpServletRequest httpRequest
    ) {
        log.info("DELETE /api/events/{}", id);
        String userId = TokenUtil.extractUserIdFromRequest(httpRequest).orElse(null);
        eventService.deleteEvent(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/events
     * Supprimer tous les événements
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteAllEvents() {
        log.info("DELETE /api/events (all)");
        eventService.deleteAllEvents();
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/events/bulk
     * Créer plusieurs événements (pour import)
     */
    @PostMapping("/bulk")
    public ResponseEntity<Map<String, Integer>> bulkCreateEvents(
            @RequestBody Map<String, List<CreateEventRequest>> body
    ) {
        List<CreateEventRequest> events = body.get("events");
        log.info("POST /api/events/bulk - count: {}", events != null ? events.size() : 0);

        if (events == null || events.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        int count = eventService.bulkCreateEvents(events);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("count", count));
    }
}
