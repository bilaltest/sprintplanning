package com.catsbanque.mabanquetools.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeletedUserResponse {
    private String message;
    private DeletedUserInfo deletedUser;
}
