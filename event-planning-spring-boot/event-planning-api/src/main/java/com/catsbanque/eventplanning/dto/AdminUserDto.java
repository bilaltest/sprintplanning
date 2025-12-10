package com.catsbanque.eventplanning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
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
}
