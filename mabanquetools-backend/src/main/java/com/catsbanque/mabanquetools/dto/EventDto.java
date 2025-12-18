package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.Event;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDto {

    private String id;
    private String title;
    private String date; // YYYY-MM-DD format
    private String endDate;
    private String startTime;
    private String endTime;
    private String color;
    private String icon;
    private String category;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EventDto fromEntity(Event event) {
        return EventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .date(event.getDate())
                .endDate(event.getEndDate())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .color(event.getColor())
                .icon(event.getIcon())
                .category(event.getCategory())
                .description(event.getDescription())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
}
