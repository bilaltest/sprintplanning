package com.catsbanque.mabanquetools.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogImageDto {

    private String id;
    private String originalFileName;
    private String url; // Data URL (base64) pour image complète
    private String thumbnailUrl; // Data URL (base64) pour thumbnail
    private String mimeType;
    private Long fileSize;
    private Integer width;
    private Integer height;
    private Integer thumbnailWidth;
    private Integer thumbnailHeight;
    private String uploadedById;
    private String uploadedByName; // Prénom + Nom
    private LocalDateTime createdAt;
}
