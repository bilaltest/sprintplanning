package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.entity.Event;
import com.catsbanque.mabanquetools.entity.Sprint;
import com.catsbanque.mabanquetools.repository.EventRepository;
import com.catsbanque.mabanquetools.repository.SprintRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SprintService {

    private final SprintRepository sprintRepository;
    private final EventRepository eventRepository;

    public List<Sprint> getAllSprints() {
        return sprintRepository.findAllByOrderByStartDateDesc();
    }

    @Transactional
    public Sprint createSprint(Sprint sprint) {
        log.info("Creating sprint: {}", sprint.getName());
        Sprint savedSprint = sprintRepository.save(sprint);
        createSprintEvents(savedSprint);
        return savedSprint;
    }

    @Transactional
    public Sprint updateSprint(String id, Sprint sprintDetails) {
        log.info("Updating sprint: {}", id);
        return sprintRepository.findById(id)
                .map(sprint -> {
                    sprint.setName(sprintDetails.getName());
                    sprint.setStartDate(sprintDetails.getStartDate());
                    sprint.setEndDate(sprintDetails.getEndDate());
                    sprint.setCodeFreezeDate(sprintDetails.getCodeFreezeDate());
                    sprint.setReleaseDateBack(sprintDetails.getReleaseDateBack());
                    sprint.setReleaseDateFront(sprintDetails.getReleaseDateFront());

                    Sprint updatedSprint = sprintRepository.save(sprint);
                    updateSprintEvents(updatedSprint);
                    return updatedSprint;
                })
                .orElseThrow(() -> new RuntimeException("Sprint not found with id " + id));
    }

    @Transactional
    public void deleteSprint(String id) {
        log.info("Deleting sprint: {}", id);
        if (sprintRepository.existsById(id)) {
            eventRepository.deleteBySprintId(id);
            sprintRepository.deleteById(id);
        } else {
            throw new RuntimeException("Sprint not found with id " + id);
        }
    }

    private void createSprintEvents(Sprint sprint) {
        // Code Freeze Event
        Event codeFreeze = new Event();
        codeFreeze.setTitle("Freeze " + sprint.getName());
        codeFreeze.setDate(sprint.getCodeFreezeDate());
        codeFreeze.setCategory("code_freeze");
        codeFreeze.setColor("#1e3a8a"); // Dark Blue
        codeFreeze.setIcon("ac_unit");
        codeFreeze.setSprintId(sprint.getId());
        codeFreeze.setDescription("Code freeze for sprint " + sprint.getName());
        eventRepository.save(codeFreeze);

        // MEP Back Event
        Event mepBack = new Event();
        mepBack.setTitle("MEP Back " + sprint.getName());
        mepBack.setDate(sprint.getReleaseDateBack());
        mepBack.setCategory("mep_back");
        mepBack.setColor("#06b6d4"); // Cyan
        mepBack.setIcon("rocket_launch");
        mepBack.setSprintId(sprint.getId());
        mepBack.setDescription("Mise en production Back sprint " + sprint.getName());
        eventRepository.save(mepBack);

        // MEP Front Event
        Event mepFront = new Event();
        mepFront.setTitle("MEP Front " + sprint.getName());
        mepFront.setDate(sprint.getReleaseDateFront());
        mepFront.setCategory("mep_front");
        mepFront.setColor("#22c55e"); // Green
        mepFront.setIcon("rocket_launch");
        mepFront.setSprintId(sprint.getId());
        mepFront.setDescription("Mise en production Front sprint " + sprint.getName());
        eventRepository.save(mepFront);
    }

    private void updateSprintEvents(Sprint sprint) {
        List<Event> sprintEvents = eventRepository.findBySprintId(sprint.getId());

        // Track if we found specific events to handle migration/missing cases
        boolean foundMepBack = false;
        boolean foundMepFront = false;

        for (Event event : sprintEvents) {
            boolean updated = false;

            if ("code_freeze".equals(event.getCategory())) {
                event.setTitle("Freeze " + sprint.getName());
                event.setDate(sprint.getCodeFreezeDate());
                event.setColor("#1e3a8a"); // Force update color
                event.setDescription("Code freeze for sprint " + sprint.getName());
                updated = true;
            } else if ("mep".equals(event.getCategory())) {
                // Migrate legacy 'mep' to 'mep_front' (or keep logic compatible)
                // We'll convert it to MEP Front
                event.setCategory("mep_front");
                event.setTitle("MEP Front " + sprint.getName());
                event.setDate(sprint.getReleaseDateFront());
                event.setIcon("rocket_launch");
                event.setColor("#22c55e");
                event.setDescription("Mise en production Front sprint " + sprint.getName());
                updated = true;
                foundMepFront = true;
            } else if ("mep_front".equals(event.getCategory())) {
                event.setTitle("MEP Front " + sprint.getName());
                event.setDate(sprint.getReleaseDateFront());
                event.setColor("#22c55e"); // Force update color
                event.setDescription("Mise en production Front sprint " + sprint.getName());
                updated = true;
                foundMepFront = true;
            } else if ("mep_back".equals(event.getCategory())) {
                event.setTitle("MEP Back " + sprint.getName());
                event.setDate(sprint.getReleaseDateBack());
                event.setColor("#06b6d4"); // Force update color
                event.setDescription("Mise en production Back sprint " + sprint.getName());
                updated = true;
                foundMepBack = true;
            }

            if (updated) {
                eventRepository.save(event);
            }
        }

        // Handle missing events (migration case or manual deletion)
        if (!foundMepBack) {
            Event mepBack = new Event();
            mepBack.setTitle("MEP Back " + sprint.getName());
            mepBack.setDate(sprint.getReleaseDateBack());
            mepBack.setCategory("mep_back");
            mepBack.setColor("#06b6d4");
            mepBack.setIcon("rocket_launch");
            mepBack.setSprintId(sprint.getId());
            mepBack.setDescription("Mise en production Back sprint " + sprint.getName());
            eventRepository.save(mepBack);
        }

        if (!foundMepFront && !foundMepBack) { // Only create if we didn't just migrate 'mep'
            // If we had neither, likely a new sprint or broken state.
            // If we had 'mep' it became 'mep_front' so foundMepFront is true.
            // If we miss front:
            Event mepFront = new Event();
            mepFront.setTitle("MEP Front " + sprint.getName());
            mepFront.setDate(sprint.getReleaseDateFront());
            mepFront.setCategory("mep_front");
            mepFront.setColor("#22c55e");
            mepFront.setIcon("rocket_launch");
            mepFront.setSprintId(sprint.getId());
            mepFront.setDescription("Mise en production Front sprint " + sprint.getName());
            eventRepository.save(mepFront);
        }
    }
}
