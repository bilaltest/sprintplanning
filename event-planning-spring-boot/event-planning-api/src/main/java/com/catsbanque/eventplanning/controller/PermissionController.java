package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.dto.UpdatePermissionsRequest;
import com.catsbanque.eventplanning.dto.UserPermissionsResponse;
import com.catsbanque.eventplanning.entity.PermissionLevel;
import com.catsbanque.eventplanning.entity.PermissionModule;
import com.catsbanque.eventplanning.service.PermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Contrôleur REST pour la gestion des permissions utilisateurs
 * Accessible uniquement aux utilisateurs avec WRITE sur ADMIN
 */
@Slf4j
@RestController
@RequestMapping("/admin/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    /**
     * GET /api/admin/permissions/{userId}
     * Récupérer les permissions d'un utilisateur
     */
    @GetMapping("/{userId}")
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.eventplanning.entity.PermissionModule).ADMIN)")
    public ResponseEntity<UserPermissionsResponse> getUserPermissions(@PathVariable String userId, org.springframework.security.core.Authentication authentication) {
        log.info("GET /api/admin/permissions/{}", userId);

        Map<PermissionModule, PermissionLevel> permissions = permissionService.getUserPermissions(userId);

        UserPermissionsResponse response = UserPermissionsResponse.builder()
                .userId(userId)
                .permissions(permissions)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/admin/permissions/{userId}
     * Mettre à jour les permissions d'un utilisateur
     *
     * Body: {
     *   "permissions": {
     *     "CALENDAR": "WRITE",
     *     "RELEASES": "READ",
     *     "ADMIN": "NONE"
     *   }
     * }
     */
    @PutMapping("/{userId}")
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.eventplanning.entity.PermissionModule).ADMIN)")
    public ResponseEntity<UserPermissionsResponse> updateUserPermissions(
            @PathVariable String userId,
            @Valid @RequestBody UpdatePermissionsRequest request,
            org.springframework.security.core.Authentication authentication
    ) {
        log.info("PUT /api/admin/permissions/{} - {}", userId, request.getPermissions());

        permissionService.updateUserPermissions(userId, request.getPermissions());

        Map<PermissionModule, PermissionLevel> updatedPermissions = permissionService.getUserPermissions(userId);

        UserPermissionsResponse response = UserPermissionsResponse.builder()
                .userId(userId)
                .permissions(updatedPermissions)
                .build();

        return ResponseEntity.ok(response);
    }
}
