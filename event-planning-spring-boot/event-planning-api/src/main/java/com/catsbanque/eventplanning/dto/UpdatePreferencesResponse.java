package com.catsbanque.eventplanning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Réponse pour PUT /api/auth/preferences
 * Format identique à Node.js: { message: string, user: UserDto }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePreferencesResponse {
    private String message;
    private UserDto user;
}
