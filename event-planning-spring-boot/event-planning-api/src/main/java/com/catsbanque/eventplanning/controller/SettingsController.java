package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.dto.SettingsDto;
import com.catsbanque.eventplanning.dto.UpdateSettingsRequest;
import com.catsbanque.eventplanning.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour les paramètres
 * Endpoints identiques à Node.js (settings.routes.js)
 */
@Slf4j
@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    /**
     * GET /api/settings
     * Récupérer les paramètres
     */
    @GetMapping
    public ResponseEntity<SettingsDto> getSettings() {
        log.info("GET /api/settings");
        SettingsDto settings = settingsService.getSettings();
        return ResponseEntity.ok(settings);
    }

    /**
     * PUT /api/settings
     * Mettre à jour les paramètres
     * Validation automatique via @Valid + DTO
     */
    @PutMapping
    public ResponseEntity<SettingsDto> updateSettings(@Valid @RequestBody UpdateSettingsRequest request) {
        log.info("PUT /api/settings - theme: {}", request.getTheme());
        SettingsDto settings = settingsService.updateSettings(
            request.getTheme(),
            request.getCustomCategories()
        );
        return ResponseEntity.ok(settings);
    }
}
