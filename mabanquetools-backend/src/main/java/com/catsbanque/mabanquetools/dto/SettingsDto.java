package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.Settings;
import com.fasterxml.jackson.annotation.JsonRawValue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsDto {

    private String id;
    private String theme;

    @JsonRawValue
    private String customCategories;

    @JsonRawValue
    private String customTags;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SettingsDto fromEntity(Settings settings) {
        return SettingsDto.builder()
                .id(settings.getId())
                .theme(settings.getTheme())
                .customCategories(settings.getCustomCategories())
                .customTags(settings.getCustomTags())
                .createdAt(settings.getCreatedAt())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }
}
