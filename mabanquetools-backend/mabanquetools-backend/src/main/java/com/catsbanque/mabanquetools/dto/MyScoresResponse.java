package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.GameScore;
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
