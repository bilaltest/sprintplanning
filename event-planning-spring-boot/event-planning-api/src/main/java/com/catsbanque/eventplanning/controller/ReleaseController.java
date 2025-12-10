package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.dto.CreateReleaseRequest;
import com.catsbanque.eventplanning.dto.ReleaseDto;
import com.catsbanque.eventplanning.service.ReleaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    /**
     * GET /api/releases
     * Récupérer toutes les releases (futures + 20 dernières passées)
     */
    @GetMapping
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
    public ResponseEntity<ReleaseDto> getRelease(@PathVariable String id) {
        log.info("GET /api/releases/{}", id);
        ReleaseDto release = releaseService.getReleaseByIdOrVersion(id);
        return ResponseEntity.ok(release);
    }

    /**
     * POST /api/releases
     * Créer une nouvelle release
     */
    @PostMapping
    public ResponseEntity<ReleaseDto> createRelease(
            @Valid @RequestBody CreateReleaseRequest request
    ) {
        log.info("POST /api/releases - name: {}, version: {}", request.getName(), request.getVersion());
        ReleaseDto release = releaseService.createRelease(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(release);
    }

    /**
     * PUT /api/releases/:id
     * Mettre à jour une release
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReleaseDto> updateRelease(
            @PathVariable String id,
            @Valid @RequestBody CreateReleaseRequest request
    ) {
        log.info("PUT /api/releases/{} - name: {}", id, request.getName());
        ReleaseDto release = releaseService.updateRelease(id, request);
        return ResponseEntity.ok(release);
    }

    /**
     * PATCH /api/releases/:id/status
     * Mettre à jour le statut d'une release
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ReleaseDto> updateReleaseStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
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
    public ResponseEntity<Void> deleteRelease(@PathVariable String id) {
        log.info("DELETE /api/releases/{}", id);
        releaseService.deleteRelease(id);
        return ResponseEntity.noContent().build();
    }
}
