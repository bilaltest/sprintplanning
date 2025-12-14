package com.catsbanque.eventplanning.dto;

import com.catsbanque.eventplanning.entity.PermissionLevel;
import com.catsbanque.eventplanning.entity.PermissionModule;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Request DTO pour mettre à jour les permissions d'un utilisateur.
 *
 * Format: { "CALENDAR": "WRITE", "RELEASES": "READ", "ADMIN": "NONE" }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePermissionsRequest {

    @NotNull(message = "Permissions map cannot be null")
    private Map<PermissionModule, PermissionLevel> permissions;
}
