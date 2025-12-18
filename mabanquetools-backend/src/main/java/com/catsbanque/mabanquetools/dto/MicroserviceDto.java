package com.catsbanque.mabanquetools.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MicroserviceDto {
    private String id;
    private String name;
    private String squad; // 'Squad 1' to 'Squad 6'
    private String solution;
    private Integer displayOrder;
    private Boolean isActive;
    private String description;
    private String previousTag; // Tag N-1 (optionnel, calculé depuis release précédente)
}
