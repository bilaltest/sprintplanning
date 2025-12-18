package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.Action;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionDto {

    private String id;
    private String squadId;
    private String phase;
    private String type;
    private String title;
    private String description;
    private String status;
    private Integer order;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private FeatureFlippingDto flipping;

    public static ActionDto fromEntity(Action action) {
        return ActionDto.builder()
                .id(action.getId())
                .squadId(action.getSquadId())
                .phase(action.getPhase())
                .type(action.getType())
                .title(action.getTitle())
                .description(action.getDescription())
                .status(action.getStatus())
                .order(action.getOrder())
                .createdAt(action.getCreatedAt())
                .updatedAt(action.getUpdatedAt())
                .flipping(action.getFlipping() != null
                    ? FeatureFlippingDto.fromEntity(action.getFlipping())
                    : null)
                .build();
    }
}
