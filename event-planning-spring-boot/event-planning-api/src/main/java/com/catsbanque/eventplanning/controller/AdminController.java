package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.dto.*;
import com.catsbanque.eventplanning.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Contrôleur REST pour l'administration (ADMIN module)
 * Endpoints identiques à Node.js (admin.routes.js)
 * Tous les endpoints nécessitent WRITE sur ADMIN
 */
@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /api/admin/users
     * Récupère la liste de tous les utilisateurs
     * Référence: admin.controller.js:9-36
     */
    @GetMapping("/users")
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.eventplanning.entity.PermissionModule).ADMIN)")
    public ResponseEntity<AdminUsersResponse> getAllUsers(org.springframework.security.core.Authentication authentication) {
        log.info("GET /api/admin/users");
        AdminUsersResponse response = adminService.getAllUsers();
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/admin/users/:id
     * Supprime un utilisateur
     * Référence: admin.controller.js:44-83
     */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.eventplanning.entity.PermissionModule).ADMIN)")
    public ResponseEntity<DeletedUserResponse> deleteUser(@PathVariable String id, org.springframework.security.core.Authentication authentication) {
        log.info("DELETE /api/admin/users/{}", id);
        DeletedUserResponse response = adminService.deleteUser(id);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/stats
     * Récupère des statistiques générales
     * Référence: admin.controller.js:89-115
     */
    @GetMapping("/stats")
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.eventplanning.entity.PermissionModule).ADMIN)")
    public ResponseEntity<AdminStatsResponse> getStats(org.springframework.security.core.Authentication authentication) {
        log.info("GET /api/admin/stats");
        AdminStatsResponse response = adminService.getStats();
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/export
     * Exporte toute la base de données en JSON
     * Référence: admin.controller.js:121-191
     */
    @GetMapping("/export")
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.eventplanning.entity.PermissionModule).ADMIN)")
    public ResponseEntity<DatabaseExportDto> exportDatabase(org.springframework.security.core.Authentication authentication) {
        log.info("GET /api/admin/export");
        DatabaseExportDto export = adminService.exportDatabase();

        // Generate filename with current date
        String filename = String.format(
                "ma-banque-tools-backup-%s.json",
                LocalDate.now().format(DateTimeFormatter.ISO_DATE)
        );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(export);
    }

    /**
     * POST /api/admin/import
     * Importe une base de données depuis un fichier JSON
     * ATTENTION: Écrase toutes les données existantes
     * Référence: admin.controller.js:198-318
     */
    @PostMapping("/import")
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.eventplanning.entity.PermissionModule).ADMIN)")
    public ResponseEntity<ImportDatabaseResponse> importDatabase(
            @RequestBody DatabaseImportRequest request,
            org.springframework.security.core.Authentication authentication
    ) {
        log.info("POST /api/admin/import");
        ImportDatabaseResponse response = adminService.importDatabase(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/create-admin-user
     * Crée un utilisateur admin avec l'email "admin" et le mot de passe "admin123"
     * Endpoint utile pour l'initialisation du système
     */
    @PostMapping("/create-admin-user")
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.eventplanning.entity.PermissionModule).ADMIN)")
    public ResponseEntity<Void> createAdminUser(org.springframework.security.core.Authentication authentication) {
        log.info("POST /api/admin/create-admin-user");
        adminService.createAdminUser();
        return ResponseEntity.noContent().build();

    }
}
