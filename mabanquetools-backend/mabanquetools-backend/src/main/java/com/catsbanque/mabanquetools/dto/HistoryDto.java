package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.Event;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour l'historique des événements
 * Contient les données parsées (Event objects) au lieu des JSON strings
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoryDto {
    private String id;
    private String action;
    private String eventId;
    private Event eventData;        // Parsed JSON → Event object
    private Event previousData;     // Parsed JSON → Event object
    private String userId;
    private String userDisplayName;
    private LocalDateTime timestamp;
}
