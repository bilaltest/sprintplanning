package com.catsbanque.eventplanning.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO pour la mise à jour de l'ordre des widgets
 * Référence: auth.controller.js:288-329
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWidgetOrderRequest {

    @NotNull(message = "widgetOrder ne peut pas être null")
    private List<String> widgetOrder;
}
