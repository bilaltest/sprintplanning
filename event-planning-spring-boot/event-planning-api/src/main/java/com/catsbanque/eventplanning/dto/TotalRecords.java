package com.catsbanque.eventplanning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TotalRecords {
    private int users;
    private int events;
    private int releases;
    private int history;
    private int releaseHistory;
    private int settings;
}
