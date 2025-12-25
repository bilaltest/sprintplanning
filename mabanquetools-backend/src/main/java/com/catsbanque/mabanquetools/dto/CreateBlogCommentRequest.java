package com.catsbanque.mabanquetools.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBlogCommentRequest {

    @NotBlank(message = "L'ID du post est obligatoire")
    private String postId;

    private String parentId; // Optionnel: ID du commentaire parent (pour threads)

    @NotBlank(message = "Le contenu du commentaire est obligatoire")
    @Size(max = 5000, message = "Le commentaire ne peut pas dépasser 5000 caractères")
    private String content;
}
