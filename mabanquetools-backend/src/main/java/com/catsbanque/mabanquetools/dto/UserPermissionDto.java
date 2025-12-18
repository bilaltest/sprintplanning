package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.PermissionLevel;
import com.catsbanque.mabanquetools.entity.PermissionModule;
import com.catsbanque.mabanquetools.entity.UserPermission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPermissionDto {

    private String id;
    private String userId;
    private PermissionModule module;
    private PermissionLevel permissionLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserPermissionDto fromEntity(UserPermission permission) {
        return UserPermissionDto.builder()
                .id(permission.getId())
                .userId(permission.getUser().getId())
                .module(permission.getModule())
                .permissionLevel(permission.getPermissionLevel())
                .createdAt(permission.getCreatedAt())
                .updatedAt(permission.getUpdatedAt())
                .build();
    }
}
