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
public class AbsenceDto {
    private String id;
    private String userId;
    private String userFirstName;
    private String userLastName;
    private LocalDate startDate;
    private LocalDate endDate;
    private AbsenceType type;
    private com.catsbanque.mabanquetools.entity.Period startPeriod;
    private com.catsbanque.mabanquetools.entity.Period endPeriod;
}
