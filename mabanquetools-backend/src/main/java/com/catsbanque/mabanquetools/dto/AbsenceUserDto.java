package com.catsbanque.mabanquetools.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbsenceUserDto {
    private String id;
    private String firstName;
    private String lastName;
    private String metier;
    private String tribu;
    private boolean interne;
    private String email;
    private List<String> squads;
}
