package com.catsbanque.mabanquetools.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Requête de mise à jour des préférences utilisateur
 */
@Data
public class UpdatePreferencesRequest {

    @NotNull(message = "Le thème est requis")
    @Pattern(regexp = "light|dark", message = "Le thème doit être 'light' ou 'dark'")
    private String themePreference;
}
