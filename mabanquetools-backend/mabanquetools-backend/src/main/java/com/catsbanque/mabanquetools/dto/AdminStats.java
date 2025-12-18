package com.catsbanque.mabanquetools.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStats {
    private long totalUsers;
    private long totalEvents;
    private long totalReleases;
    private long totalHistoryEntries;
}
