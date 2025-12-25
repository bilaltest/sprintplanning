package com.catsbanque.mabanquetools.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBlogPostRequest {

    @Size(max = 255, message = "Le titre ne peut pas dépasser 255 caractères")
    private String title;

    private String content;

    @Size(max = 500, message = "L'URL de l'image de couverture ne peut pas dépasser 500 caractères")
    private String coverImage;

    private List<String> tagIds; // IDs des tags à associer (remplace les tags existants)
}
