package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.Squad;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SquadDto {

    private String id;
    private String releaseId;
    private Integer squadNumber;
    private String tontonMep;
    private Boolean isCompleted;
    private Boolean featuresEmptyConfirmed;
    private Boolean preMepEmptyConfirmed;
    private Boolean postMepEmptyConfirmed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<FeatureDto> features;
    private List<ActionDto> actions;

    public static SquadDto fromEntity(Squad squad) {
        return SquadDto.builder()
                .id(squad.getId())
                .releaseId(squad.getRelease() != null ? squad.getRelease().getId() : null)
                .squadNumber(squad.getSquadNumber())
                .tontonMep(squad.getTontonMep())
                .isCompleted(squad.getIsCompleted())
                .featuresEmptyConfirmed(squad.getFeaturesEmptyConfirmed())
                .preMepEmptyConfirmed(squad.getPreMepEmptyConfirmed())
                .postMepEmptyConfirmed(squad.getPostMepEmptyConfirmed())
                .createdAt(squad.getCreatedAt())
                .updatedAt(squad.getUpdatedAt())
                .features(squad.getFeatures() != null
                    ? squad.getFeatures().stream()
                        .map(FeatureDto::fromEntity)
                        .collect(Collectors.toList())
                    : List.of())
                .actions(squad.getActions() != null
                    ? squad.getActions().stream()
                        .map(ActionDto::fromEntity)
                        .collect(Collectors.toList())
                    : List.of())
                .build();
    }
}
