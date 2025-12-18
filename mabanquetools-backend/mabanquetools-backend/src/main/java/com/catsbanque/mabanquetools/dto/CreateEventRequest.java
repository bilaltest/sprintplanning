package com.catsbanque.mabanquetools.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEventRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Date is required")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Date must be in YYYY-MM-DD format")
    private String date;

    private String endDate;

    private String startTime;

    private String endTime;

    @NotBlank(message = "Color is required")
    private String color;

    @NotBlank(message = "Icon is required")
    private String icon;

    @NotBlank(message = "Category is required")
    private String category;

    private String description;
}
