package com.catsbanque.eventplanning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntry {
    private String id;
    private int rank;
    private int score;
    private Integer wpm;
    private Double accuracy;
    private LocalDateTime createdAt;
    private String userId;
    private LeaderboardUser user;
    private String visitorName;
}
