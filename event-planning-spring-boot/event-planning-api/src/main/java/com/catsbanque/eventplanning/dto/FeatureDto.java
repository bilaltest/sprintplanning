package com.catsbanque.eventplanning.dto;

import com.catsbanque.eventplanning.entity.Feature;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureDto {

    private String id;
    private String squadId;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FeatureDto fromEntity(Feature feature) {
        return FeatureDto.builder()
                .id(feature.getId())
                .squadId(feature.getSquadId())
                .title(feature.getTitle())
                .description(feature.getDescription())
                .createdAt(feature.getCreatedAt())
                .updatedAt(feature.getUpdatedAt())
                .build();
    }
}
