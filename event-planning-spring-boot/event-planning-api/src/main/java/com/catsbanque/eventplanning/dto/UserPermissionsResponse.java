package com.catsbanque.eventplanning.dto;

import com.catsbanque.eventplanning.entity.PermissionLevel;
import com.catsbanque.eventplanning.entity.PermissionModule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Response DTO contenant les permissions d'un utilisateur.
 *
 * Format: { "CALENDAR": "WRITE", "RELEASES": "READ", "ADMIN": "NONE" }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPermissionsResponse {

    private String userId;
    private Map<PermissionModule, PermissionLevel> permissions;
}
