package com.catsbanque.eventplanning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReleaseRequest {

    @NotBlank(message = "Name is required")
    private String name; // Contient déjà la version (ex: "Release v40.5")

    @NotBlank(message = "Release date is required")
    private String releaseDate; // Format ISO string: "2025-01-15T10:00:00.000Z" ou "2025-01-15"

    private String type = "release";

    private String description;
}
