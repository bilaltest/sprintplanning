package com.catsbanque.eventplanning.dto;

import com.catsbanque.eventplanning.entity.FeatureFlipping;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureFlippingDto {

    private String id;
    private String actionId;
    private String flippingType;
    private String ruleName;
    private String theme;
    private String ruleAction;
    private String ruleState;
    private List<String> targetClients;
    private String targetCaisses;
    private List<String> targetOS;
    private List<String> targetVersions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private static final ObjectMapper mapper = new ObjectMapper();

    public static FeatureFlippingDto fromEntity(FeatureFlipping flipping) {
        try {
            return FeatureFlippingDto.builder()
                    .id(flipping.getId())
                    .actionId(flipping.getActionId())
                    .flippingType(flipping.getFlippingType())
                    .ruleName(flipping.getRuleName())
                    .theme(flipping.getTheme())
                    .ruleAction(flipping.getRuleAction())
                    .ruleState(flipping.getRuleState())
                    .targetClients(parseJsonArray(flipping.getTargetClients()))
                    .targetCaisses(flipping.getTargetCaisses())
                    .targetOS(parseJsonArray(flipping.getTargetOS()))
                    .targetVersions(parseJsonArray(flipping.getTargetVersions()))
                    .createdAt(flipping.getCreatedAt())
                    .updatedAt(flipping.getUpdatedAt())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error converting FeatureFlipping to DTO", e);
        }
    }

    private static List<String> parseJsonArray(String json) {
        if (json == null || json.isEmpty() || "[]".equals(json)) {
            return List.of();
        }
        try {
            return mapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }
}
