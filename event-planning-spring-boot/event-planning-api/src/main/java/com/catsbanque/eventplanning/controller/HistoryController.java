package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.dto.HistoryDto;
import com.catsbanque.eventplanning.service.HistoryService;
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
 * Contrôleur REST pour l'historique des événements
 * Endpoints identiques à Node.js (history.routes.js)
 */
@Slf4j
@RestController
@RequestMapping("/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    /**
     * GET /api/history
     * Récupérer l'historique (30 derniers)
     * Référence: history.controller.js:37-59
     */
    @GetMapping
    public ResponseEntity<List<HistoryDto>> getHistory() {
        log.info("GET /api/history");
        List<HistoryDto> history = historyService.getHistory();
        return ResponseEntity.ok(history);
    }

    /**
     * POST /api/history/:id/rollback
     * Annuler une modification
     * Référence: history.controller.js:61-106
     */
    @PostMapping("/{id}/rollback")
    public ResponseEntity<Map<String, String>> rollbackHistory(@PathVariable String id) {
        log.info("POST /api/history/{}/rollback", id);
        historyService.rollbackHistory(id);
        return ResponseEntity.ok(Map.of("message", "Rollback successful"));
    }

    /**
     * DELETE /api/history
     * Vider l'historique
     * Référence: history.controller.js:108-116
     */
    @DeleteMapping
    public ResponseEntity<Void> clearHistory() {
        log.info("DELETE /api/history");
        historyService.clearHistory();
        return ResponseEntity.noContent().build();
    }
}
