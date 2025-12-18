package com.catsbanque.eventplanning.dto;

import com.catsbanque.eventplanning.entity.Event;
import com.catsbanque.eventplanning.entity.History;
import com.catsbanque.eventplanning.entity.Release;
import com.catsbanque.eventplanning.entity.ReleaseHistory;
import com.catsbanque.eventplanning.entity.Settings;
import com.catsbanque.eventplanning.entity.User;
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
}
