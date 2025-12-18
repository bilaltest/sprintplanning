package com.catsbanque.mabanquetools.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitScoreResponse {
    private String id;
    private String gameId;
    private String userId;
    private Integer score;
    private Integer wpm;
    private Double accuracy;
    private String metadata;
    private LocalDateTime createdAt;
    private int rank;
    private boolean newPersonalBest;  // Lombok will generate isNewPersonalBest() getter
    private LeaderboardUser user;
}
