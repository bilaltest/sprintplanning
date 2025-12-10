package com.catsbanque.eventplanning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitScoreRequest {
    private Integer score;
    private Integer wpm;
    private Double accuracy;
    private Object metadata; // Can be any JSON object
}
