package com.catsbanque.mabanquetools.dto;

import com.catsbanque.mabanquetools.entity.Event;
import com.catsbanque.mabanquetools.entity.History;
import com.catsbanque.mabanquetools.entity.Release;
import com.catsbanque.mabanquetools.entity.ReleaseHistory;
import com.catsbanque.mabanquetools.entity.Settings;
import com.catsbanque.mabanquetools.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExportData {
    private List<User> users;
    private List<Event> events;
    private List<Release> releases;
    private List<History> history;
    private List<ReleaseHistory> releaseHistory;
    private List<Settings> settings;
    private List<com.catsbanque.mabanquetools.entity.Absence> absences;
    private List<com.catsbanque.mabanquetools.entity.Sprint> sprints;
    private List<com.catsbanque.mabanquetools.entity.Microservice> microservices;
    private List<com.catsbanque.mabanquetools.entity.Game> games;
    private List<com.catsbanque.mabanquetools.entity.GameScore> gameScores;
    private List<com.catsbanque.mabanquetools.entity.UserPermission> userPermissions;
    private List<com.catsbanque.mabanquetools.entity.ReleaseNoteEntry> releaseNoteEntries;
    private List<com.catsbanque.mabanquetools.entity.ClosedDay> closedDays;
}
