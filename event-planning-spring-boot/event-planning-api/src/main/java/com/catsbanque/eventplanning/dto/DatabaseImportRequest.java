package com.catsbanque.eventplanning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DatabaseImportRequest {
    private ExportMetadata metadata;
    private ExportData data;
}
