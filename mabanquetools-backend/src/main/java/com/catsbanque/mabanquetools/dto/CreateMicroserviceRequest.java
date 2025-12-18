package com.catsbanque.mabanquetools.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMicroserviceRequest {

    @NotBlank(message = "Le nom du microservice est requis")
    private String name;

    @NotBlank(message = "La squad est requise")
    private String squad; // 'Squad 1' to 'Squad 6'

    @NotBlank(message = "La solution est requise")
    private String solution;

    private Integer displayOrder;
    private String description;
}
