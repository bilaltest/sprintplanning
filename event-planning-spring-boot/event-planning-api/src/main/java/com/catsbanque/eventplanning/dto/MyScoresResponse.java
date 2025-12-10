package com.catsbanque.eventplanning.dto;

import com.catsbanque.eventplanning.entity.GameScore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyScoresResponse {
    private List<GameScore> scores;
    private int bestScore;
    private int gamesPlayed;
}
