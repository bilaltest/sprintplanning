package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.PermissionLevel;
import com.catsbanque.mabanquetools.entity.PermissionModule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

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
    private String metier;
    private String tribu;
    private boolean interne;
    private List<String> squads;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long historiesCount;
    private Map<PermissionModule, PermissionLevel> permissions;
}
