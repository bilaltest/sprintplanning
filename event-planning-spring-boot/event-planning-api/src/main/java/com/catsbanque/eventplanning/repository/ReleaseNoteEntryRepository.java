package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.ReleaseNoteEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReleaseNoteEntryRepository extends JpaRepository<ReleaseNoteEntry, String> {

    /**
     * Trouve toutes les entrées pour une release donnée, triées par squad puis par ordre de déploiement
     */
    @Query("SELECT e FROM ReleaseNoteEntry e WHERE e.releaseId = :releaseId ORDER BY e.squad ASC, e.deployOrder ASC NULLS LAST, e.microservice ASC")
    List<ReleaseNoteEntry> findByReleaseIdOrderBySquadAndDeployOrder(@Param("releaseId") String releaseId);

    /**
     * Trouve toutes les entrées pour une release et une squad données
     */
    @Query("SELECT e FROM ReleaseNoteEntry e WHERE e.releaseId = :releaseId AND e.squad = :squad ORDER BY e.deployOrder ASC NULLS LAST, e.microservice ASC")
    List<ReleaseNoteEntry> findByReleaseIdAndSquad(@Param("releaseId") String releaseId, @Param("squad") String squad);

    /**
     * Supprime toutes les entrées d'une release
     */
    void deleteByReleaseId(String releaseId);

    /**
     * Trouve les dernières entrées pour tous les microservices de la release N-1
     * Utilisé pour enrichir les microservices avec previousTag lors du chargement
     */
    @Query("SELECT e FROM ReleaseNoteEntry e " +
           "WHERE e.releaseId = (" +
           "    SELECT r2.id FROM Release r2 " +
           "    WHERE r2.id != :currentReleaseId " +
           "    AND r2.releaseDate < (SELECT r3.releaseDate FROM Release r3 WHERE r3.id = :currentReleaseId) " +
           "    ORDER BY r2.releaseDate DESC " +
           "    LIMIT 1" +
           ") " +
           "AND e.tag IS NOT NULL " +
           "AND e.tag != ''")
    List<ReleaseNoteEntry> findAllPreviousTagsForRelease(@Param("currentReleaseId") String currentReleaseId);
}
