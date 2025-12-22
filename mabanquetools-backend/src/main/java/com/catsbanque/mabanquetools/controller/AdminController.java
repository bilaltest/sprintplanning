package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.AdminStatsResponse;
import com.catsbanque.mabanquetools.dto.AdminUpdateUserRequest;
import com.catsbanque.mabanquetools.dto.AdminUserDto;
import com.catsbanque.mabanquetools.dto.AdminUsersResponse;
import com.catsbanque.mabanquetools.dto.DatabaseExportDto;
import com.catsbanque.mabanquetools.dto.DatabaseImportRequest;
import com.catsbanque.mabanquetools.dto.DeletedUserResponse;
import com.catsbanque.mabanquetools.dto.ImportDatabaseResponse;
import com.catsbanque.mabanquetools.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

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
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).ADMIN)")
    public ResponseEntity<AdminUsersResponse> getAllUsers(
            org.springframework.security.core.Authentication authentication) {
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
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).ADMIN)")
    public ResponseEntity<DeletedUserResponse> deleteUser(@PathVariable String id,
            org.springframework.security.core.Authentication authentication) {
        log.info("DELETE /api/admin/users/{}", id);
        DeletedUserResponse response = adminService.deleteUser(id);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/admin/users/:id
     * Met à jour un utilisateur
     */
    @PutMapping("/users/{id}")
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).ADMIN)")
    public ResponseEntity<AdminUserDto> updateUser(
            @PathVariable String id,
            @RequestBody AdminUpdateUserRequest request,
            org.springframework.security.core.Authentication authentication) {
        log.info("PUT /api/admin/users/{}", id);
        AdminUserDto response = adminService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/users/:id/reset-password
     * Réinitialise le mot de passe d'un utilisateur à "password"
     */
    @PostMapping("/users/{id}/reset-password")
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).ADMIN)")
    public ResponseEntity<Void> resetUserPassword(@PathVariable String id,
            org.springframework.security.core.Authentication authentication) {
        log.info("POST /api/admin/users/{}/reset-password", id);
        adminService.resetUserPassword(id);
        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/admin/stats
     * Récupère des statistiques générales
     * Référence: admin.controller.js:89-115
     */
    @GetMapping("/stats")
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).ADMIN)")
    public ResponseEntity<AdminStatsResponse> getStats(
            org.springframework.security.core.Authentication authentication) {
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
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).ADMIN)")
    public ResponseEntity<DatabaseExportDto> exportDatabase(
            org.springframework.security.core.Authentication authentication) {
        log.info("GET /api/admin/export");
        DatabaseExportDto export = adminService.exportDatabase();

        // Generate filename with current date
        String filename = String.format(
                "ma-banque-tools-backup-%s.json",
                LocalDate.now().format(DateTimeFormatter.ISO_DATE));

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
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).ADMIN)")
    public ResponseEntity<ImportDatabaseResponse> importDatabase(
            @RequestBody DatabaseImportRequest request,
            org.springframework.security.core.Authentication authentication) {
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
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).ADMIN)")
    public ResponseEntity<Void> createAdminUser(org.springframework.security.core.Authentication authentication) {
        log.info("POST /api/admin/create-admin-user");
        adminService.createAdminUser();
        return ResponseEntity.noContent().build();

    }
}
