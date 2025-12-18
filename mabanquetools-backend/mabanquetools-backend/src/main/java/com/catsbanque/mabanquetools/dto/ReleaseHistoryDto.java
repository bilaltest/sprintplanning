package com.catsbanque.mabanquetools.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour l'historique des releases
 * Contient les données parsées (JsonNode) au lieu des JSON strings
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReleaseHistoryDto {
    private String id;
    private String action;
    private String releaseId;
    private JsonNode releaseData;   // Parsed JSON → JsonNode object
    private JsonNode previousData;  // Parsed JSON → JsonNode object
    private String userId;
    private String userDisplayName;
    private LocalDateTime timestamp;
}
