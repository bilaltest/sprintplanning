package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.SettingsDto;
import com.catsbanque.mabanquetools.dto.UpdateSettingsRequest;
import com.catsbanque.mabanquetools.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Contrôleur REST pour les paramètres (hérite des droits CALENDAR)
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
     * Nécessite READ ou WRITE sur CALENDAR
     */
    @GetMapping
    @PreAuthorize("@permissionService.hasReadAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).CALENDAR)")
    public ResponseEntity<SettingsDto> getSettings(org.springframework.security.core.Authentication authentication) {
        log.info("GET /api/settings");
        SettingsDto settings = settingsService.getSettings();
        return ResponseEntity.ok(settings);
    }

    /**
     * PUT /api/settings
     * Mettre à jour les paramètres
     * Validation automatique via @Valid + DTO
     * Nécessite WRITE sur CALENDAR
     */
    @PutMapping
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).CALENDAR)")
    public ResponseEntity<SettingsDto> updateSettings(@Valid @RequestBody UpdateSettingsRequest request,
            org.springframework.security.core.Authentication authentication) {
        log.info("PUT /api/settings - theme: {}", request.getTheme());
        SettingsDto settings = settingsService.updateSettings(
                request.getTheme(),
                request.getCustomCategories() != null ? request.getCustomCategories().toString() : "[]",
                request.getCustomTags() != null ? request.getCustomTags().toString() : "[]");
        return ResponseEntity.ok(settings);
    }
}
