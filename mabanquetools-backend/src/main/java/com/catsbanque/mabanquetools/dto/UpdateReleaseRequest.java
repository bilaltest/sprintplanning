package com.catsbanque.mabanquetools.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReleaseRequest {

    private String name; // Contient déjà la version (ex: "Release v40.5")

    private String releaseDate; // Format ISO string: "2025-01-15T10:00:00.000Z" ou "2025-01-15"

    private String type;

    private String description;

    private String status;
}
