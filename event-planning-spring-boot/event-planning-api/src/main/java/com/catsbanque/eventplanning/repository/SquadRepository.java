package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.Squad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SquadRepository extends JpaRepository<Squad, String> {

    /**
     * Find all squads for a release
     */
    List<Squad> findByReleaseIdOrderBySquadNumberAsc(String releaseId);

    /**
     * Find squad by release and squad number
     */
    Optional<Squad> findByReleaseIdAndSquadNumber(String releaseId, Integer squadNumber);

    /**
     * Find completed squads for a release
     */
    List<Squad> findByReleaseIdAndIsCompletedOrderBySquadNumberAsc(String releaseId, Boolean isCompleted);
}
