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
public class AdminUpdateUserRequest {
    private String firstName;
    private String lastName;
    private String metier;
    private String tribu;
    private Boolean interne;
    private List<String> squads;
}
