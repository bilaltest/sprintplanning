package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionRepository extends JpaRepository<Action, String> {

    /**
     * Find all actions for a squad
     */
    List<Action> findBySquadIdOrderByOrderAsc(String squadId);

    /**
     * Find actions by squad and phase
     */
    List<Action> findBySquadIdAndPhaseOrderByOrderAsc(String squadId, String phase);

    /**
     * Find actions by squad and status
     */
    List<Action> findBySquadIdAndStatusOrderByOrderAsc(String squadId, String status);

    /**
     * Count completed actions for a squad
     */
    long countBySquadIdAndStatus(String squadId, String status);

    /**
     * Count total actions for a squad
     */
    long countBySquadId(String squadId);
}
