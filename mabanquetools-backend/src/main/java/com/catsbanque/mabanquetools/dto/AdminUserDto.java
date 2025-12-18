package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.PermissionLevel;
import com.catsbanque.mabanquetools.entity.PermissionModule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDto {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String themePreference;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long historiesCount;
    private Map<PermissionModule, PermissionLevel> permissions;
}
