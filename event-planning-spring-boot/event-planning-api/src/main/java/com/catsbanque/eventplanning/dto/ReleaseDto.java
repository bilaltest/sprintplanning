package com.catsbanque.eventplanning.dto;

import com.catsbanque.eventplanning.entity.Release;
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
public class ReleaseDto {

    private String id;
    private String name; // Contient déjà la version
    private LocalDateTime releaseDate;
    private String status;
    private String type;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SquadDto> squads;

    public static ReleaseDto fromEntity(Release release) {
        return ReleaseDto.builder()
                .id(release.getId())
                .name(release.getName())
                .releaseDate(release.getReleaseDate())
                .status(release.getStatus())
                .type(release.getType())
                .description(release.getDescription())
                .createdAt(release.getCreatedAt())
                .updatedAt(release.getUpdatedAt())
                .squads(release.getSquads() != null
                    ? release.getSquads().stream()
                        .map(SquadDto::fromEntity)
                        .collect(Collectors.toList())
                    : List.of())
                .build();
    }
}
