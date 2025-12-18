package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.dto.CreateReleaseRequest;
import com.catsbanque.eventplanning.dto.ReleaseDto;
import com.catsbanque.eventplanning.dto.UpdateReleaseRequest;
import com.catsbanque.eventplanning.service.ActionService;
import com.catsbanque.eventplanning.service.FeatureService;
import com.catsbanque.eventplanning.service.ReleaseService;
import com.catsbanque.eventplanning.service.SquadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour les releases
 * Endpoints identiques à Node.js (release.routes.js)
 */
@Slf4j
@RestController
@RequestMapping("/releases")
@RequiredArgsConstructor
public class ReleaseController {

    private final ReleaseService releaseService;
    private final SquadService squadService;
    private final FeatureService featureService;
    private final ActionService actionService;

    /**
     * GET /api/releases
     * Récupérer toutes les releases (futures + 20 dernières passées)
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('PERMISSION_RELEASES_READ', 'PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<List<ReleaseDto>> getAllReleases() {
        log.info("GET /api/releases");
        List<ReleaseDto> releases = releaseService.getAllReleases();
        return ResponseEntity.ok(releases);
    }

    /**
     * GET /api/releases/:id
     * Récupérer une release par ID ou version
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PERMISSION_RELEASES_READ', 'PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<ReleaseDto> getRelease(@PathVariable String id) {
        log.info("GET /api/releases/{}", id);
        ReleaseDto release = releaseService.getReleaseById(id);
        return ResponseEntity.ok(release);
    }

    /**
     * POST /api/releases
     * Créer une nouvelle release
     */
    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<ReleaseDto> createRelease(
            @Valid @RequestBody CreateReleaseRequest request) {
        log.info("POST /api/releases - name: {}", request.getName());
        ReleaseDto release = releaseService.createRelease(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(release);
    }

    /**
     * PUT /api/releases/:id
     * Mettre à jour une release
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<ReleaseDto> updateRelease(
            @PathVariable String id,
            @RequestBody UpdateReleaseRequest request) {
        log.info("PUT /api/releases/{} - update request", id);
        ReleaseDto release = releaseService.updateRelease(id, request);
        return ResponseEntity.ok(release);
    }

    /**
     * PATCH /api/releases/:id/status
     * Mettre à jour le statut d'une release
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<ReleaseDto> updateReleaseStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        log.info("PATCH /api/releases/{}/status - status: {}", id, status);
        ReleaseDto release = releaseService.updateReleaseStatus(id, status);
        return ResponseEntity.ok(release);
    }

    /**
     * DELETE /api/releases/:id
     * Supprimer une release
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<Void> deleteRelease(@PathVariable String id) {
        log.info("DELETE /api/releases/{}", id);
        releaseService.deleteRelease(id);
        return ResponseEntity.noContent().build();
    }

    // ===== SQUAD ENDPOINTS =====

    /**
     * PUT /api/releases/squads/:squadId
     * Mettre à jour un squad (tonton MEP, confirmations)
     */
    @PutMapping("/squads/{squadId}")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<Void> updateSquad(
            @PathVariable String squadId,
            @RequestBody SquadService.UpdateSquadRequest request) {
        log.info("PUT /api/releases/squads/{}", squadId);
        squadService.updateSquad(squadId, request);
        return ResponseEntity.ok().build();
    }

    // ===== FEATURE ENDPOINTS =====

    /**
     * POST /api/releases/squads/:squadId/features
     * Créer une nouvelle feature pour un squad
     */
    @PostMapping("/squads/{squadId}/features")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<Void> createFeature(
            @PathVariable String squadId,
            @RequestBody FeatureService.CreateFeatureRequest request) {
        log.info("POST /api/releases/squads/{}/features", squadId);
        featureService.createFeature(squadId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * PUT /api/releases/features/:featureId
     * Mettre à jour une feature
     */
    @PutMapping("/features/{featureId}")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<Void> updateFeature(
            @PathVariable String featureId,
            @RequestBody FeatureService.UpdateFeatureRequest request) {
        log.info("PUT /api/releases/features/{}", featureId);
        featureService.updateFeature(featureId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/releases/features/:featureId
     * Supprimer une feature
     */
    @DeleteMapping("/features/{featureId}")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<Void> deleteFeature(@PathVariable String featureId) {
        log.info("DELETE /api/releases/features/{}", featureId);
        featureService.deleteFeature(featureId);
        return ResponseEntity.noContent().build();
    }

    // ===== ACTION ENDPOINTS =====

    /**
     * POST /api/releases/squads/:squadId/actions
     * Créer une nouvelle action pour un squad
     */
    @PostMapping("/squads/{squadId}/actions")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<Void> createAction(
            @PathVariable String squadId,
            @RequestBody ActionService.CreateActionRequest request) {
        log.info("POST /api/releases/squads/{}/actions", squadId);
        actionService.createAction(squadId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * PUT /api/releases/actions/:actionId
     * Mettre à jour une action
     */
    @PutMapping("/actions/{actionId}")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<Void> updateAction(
            @PathVariable String actionId,
            @RequestBody ActionService.UpdateActionRequest request) {
        log.info("PUT /api/releases/actions/{}", actionId);
        actionService.updateAction(actionId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/releases/actions/:actionId
     * Supprimer une action
     */
    @DeleteMapping("/actions/{actionId}")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<Void> deleteAction(@PathVariable String actionId) {
        log.info("DELETE /api/releases/actions/{}", actionId);
        actionService.deleteAction(actionId);
        return ResponseEntity.noContent().build();
    }
}
