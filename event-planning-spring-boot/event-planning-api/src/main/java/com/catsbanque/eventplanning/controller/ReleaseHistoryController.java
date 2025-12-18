package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.dto.ReleaseHistoryDto;
import com.catsbanque.eventplanning.service.ReleaseHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour l'historique des releases
 * Endpoints identiques à Node.js (release-history.routes.js)
 */
@Slf4j
@RestController
@RequestMapping("/release-history")
@RequiredArgsConstructor
public class ReleaseHistoryController {

    private final ReleaseHistoryService releaseHistoryService;

    /**
     * GET /api/release-history
     * Récupérer l'historique des releases (30 derniers)
     * Référence: release-history.controller.js:37-59
     */
    @GetMapping
    public ResponseEntity<List<ReleaseHistoryDto>> getReleaseHistory() {
        log.info("GET /api/release-history");
        List<ReleaseHistoryDto> history = releaseHistoryService.getReleaseHistory();
        return ResponseEntity.ok(history);
    }

    /**
     * POST /api/release-history/:id/rollback
     * Annuler une modification
     * Référence: release-history.controller.js:61-127
     */
    @PostMapping("/{id}/rollback")
    public ResponseEntity<Map<String, String>> rollbackReleaseHistory(@PathVariable String id) {
        log.info("POST /api/release-history/{}/rollback", id);
        releaseHistoryService.rollbackReleaseHistory(id);
        return ResponseEntity.ok(Map.of("message", "Rollback successful"));
    }

    /**
     * DELETE /api/release-history
     * Vider l'historique
     * Référence: release-history.controller.js:129-137
     */
    @DeleteMapping
    public ResponseEntity<Void> clearReleaseHistory() {
        log.info("DELETE /api/release-history");
        releaseHistoryService.clearReleaseHistory();
        return ResponseEntity.noContent().build();
    }
}
