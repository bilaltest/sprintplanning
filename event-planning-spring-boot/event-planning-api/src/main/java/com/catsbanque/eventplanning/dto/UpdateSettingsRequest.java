package com.catsbanque.eventplanning.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la mise à jour des paramètres
 * Validation stricte des entrées utilisateur
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSettingsRequest {

    /**
     * Thème de l'application (light ou dark)
     */
    @NotNull(message = "Le thème est requis")
    @Pattern(regexp = "^(light|dark)$", message = "Le thème doit être 'light' ou 'dark'")
    private String theme;

    /**
     * Catégories personnalisées (JSON string)
     * Format attendu: JSON array string (ex: "[]" ou "[{...}]")
     * La validation JSON détaillée est faite côté service
     */
    private JsonNode customCategories;
}
