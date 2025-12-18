package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.CreateEventRequest;
import com.catsbanque.mabanquetools.dto.EventDto;
import com.catsbanque.mabanquetools.service.EventService;
import com.catsbanque.mabanquetools.util.TokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    @PreAuthorize("hasAnyAuthority('PERMISSION_CALENDAR_READ', 'PERMISSION_CALENDAR_WRITE')")
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
    @PreAuthorize("hasAnyAuthority('PERMISSION_CALENDAR_READ', 'PERMISSION_CALENDAR_WRITE')")
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
    @PreAuthorize("hasAuthority('PERMISSION_CALENDAR_WRITE')")
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
    @PreAuthorize("hasAuthority('PERMISSION_CALENDAR_WRITE')")
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
    @PreAuthorize("hasAuthority('PERMISSION_CALENDAR_WRITE')")
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
    @PreAuthorize("hasAuthority('PERMISSION_CALENDAR_WRITE')")
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
    @PreAuthorize("hasAuthority('PERMISSION_CALENDAR_WRITE')")
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
