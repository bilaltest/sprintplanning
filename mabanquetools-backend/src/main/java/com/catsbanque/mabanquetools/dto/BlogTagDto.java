package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.BlogTag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogTagDto {

    private String id;
    private String name;
    private String slug;
    private String color;
    private Integer postCount; // Nombre de posts avec ce tag
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Convertit une entité BlogTag en DTO.
     */
    public static BlogTagDto fromEntity(BlogTag tag) {
        if (tag == null) {
            return null;
        }

        return BlogTagDto.builder()
                .id(tag.getId())
                .name(tag.getName())
                .slug(tag.getSlug())
                .color(tag.getColor())
                .postCount(tag.getPostCount())
                .createdAt(tag.getCreatedAt())
                .updatedAt(tag.getUpdatedAt())
                .build();
    }
}
