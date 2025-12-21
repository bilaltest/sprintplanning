package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.AbsenceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAbsenceRequest {
    private String userId; // Optional, defaults to current user if not admin
    private LocalDate startDate;
    private LocalDate endDate;
    private AbsenceType type;
    private com.catsbanque.mabanquetools.entity.Period startPeriod;
    private com.catsbanque.mabanquetools.entity.Period endPeriod;
}
