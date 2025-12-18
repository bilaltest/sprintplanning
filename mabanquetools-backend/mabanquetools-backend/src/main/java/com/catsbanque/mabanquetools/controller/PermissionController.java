package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.UpdatePermissionsRequest;
import com.catsbanque.mabanquetools.dto.UserPermissionsResponse;
import com.catsbanque.mabanquetools.entity.PermissionLevel;
import com.catsbanque.mabanquetools.entity.PermissionModule;
import com.catsbanque.mabanquetools.service.PermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).ADMIN)")
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
    @PreAuthorize("@permissionService.hasWriteAccess(principal, T(com.catsbanque.mabanquetools.entity.PermissionModule).ADMIN)")
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
