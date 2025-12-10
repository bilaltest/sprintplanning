package com.catsbanque.eventplanning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExportMetadata {
    private String exportDate;
    private String version;
    private TotalRecords totalRecords;
}
