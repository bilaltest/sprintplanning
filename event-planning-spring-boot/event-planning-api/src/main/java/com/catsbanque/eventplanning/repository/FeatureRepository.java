package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.Feature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeatureRepository extends JpaRepository<Feature, String> {

    /**
     * Find all features for a squad
     */
    List<Feature> findBySquadIdOrderByCreatedAtAsc(String squadId);

    /**
     * Count features for a squad
     */
    long countBySquadId(String squadId);

    @org.springframework.data.jpa.repository.Query("SELECT f FROM Feature f JOIN f.squad s WHERE s.release.id = :releaseId AND f.type = :type")
    List<Feature> findByReleaseIdAndType(String releaseId, String type);
}
