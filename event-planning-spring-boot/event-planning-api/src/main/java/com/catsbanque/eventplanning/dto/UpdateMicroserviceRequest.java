package com.catsbanque.eventplanning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMicroserviceRequest {
    private String name;
    private String squad;
    private String solution;
    private Integer displayOrder;
    private Boolean isActive;
    private String description;
}
