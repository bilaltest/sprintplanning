package com.catsbanque.eventplanning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReleaseNoteEntryDto {
    private String id;
    private String releaseId;

    // Microservice info
    private String microserviceId; // Preferred: ID reference to microservice table
    private String microservice;   // Legacy: Free text or fallback display name
    private String microserviceName; // Display name from microservice entity
    private String solution;      // Solution from microservice entity

    private String squad;
    private Boolean partEnMep;
    private Integer deployOrder;
    private String tag;
    private String previousTag; // Tag N-1 en production
    private String parentVersion;
    private List<ChangeItem> changes = new ArrayList<>();
    private String comment; // Commentaire libre
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangeItem {
        private String jiraId;
        private String description;
    }
}
