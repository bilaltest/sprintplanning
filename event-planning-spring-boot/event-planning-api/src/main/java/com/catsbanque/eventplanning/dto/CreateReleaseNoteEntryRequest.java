package com.catsbanque.eventplanning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.catsbanque.eventplanning.entity.DeploymentStatus;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReleaseNoteEntryRequest {

    // Preferred: Use microserviceId to reference microservice entity
    private String microserviceId;

    // Legacy/Fallback: Free text microservice name (used if microserviceId is null)
    private String microservice;

    @NotBlank(message = "La squad est requise")
    private String squad;

    @NotNull(message = "Le champ 'partEnMep' est requis")
    private Boolean partEnMep;

    private Integer deployOrder;
    private String tag;
    private String previousTag; // Tag N-1 en production
    private String parentVersion;
    private List<ReleaseNoteEntryDto.ChangeItem> changes = new ArrayList<>();
    private String comment; // Commentaire libre
    private DeploymentStatus status;
}
