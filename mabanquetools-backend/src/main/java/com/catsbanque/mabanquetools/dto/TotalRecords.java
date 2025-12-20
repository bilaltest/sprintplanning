package com.catsbanque.mabanquetools.dto;

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
    private int absences;
    private int sprints;
    private int microservices;
    private int games;
    private int gameScores;
    private int userPermissions;
    private int releaseNoteEntries;
}
