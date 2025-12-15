package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.Microservice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MicroserviceRepository extends JpaRepository<Microservice, String> {

    /**
     * Find all active microservices ordered by squad and display order
     */
    @Query("SELECT m FROM Microservice m WHERE m.isActive = true ORDER BY m.squad, m.displayOrder, m.name")
    List<Microservice> findAllActive();

    /**
     * Find active microservices by squad
     */
    @Query("SELECT m FROM Microservice m WHERE m.isActive = true AND m.squad = :squad ORDER BY m.displayOrder, m.name")
    List<Microservice> findActiveBySquad(@Param("squad") String squad);

    /**
     * Find microservice by name
     */
    Optional<Microservice> findByName(String name);

    /**
     * Check if microservice name exists (for validation)
     */
    boolean existsByNameAndIdNot(String name, String id);

    /**
     * Count active microservices
     */
    @Query("SELECT COUNT(m) FROM Microservice m WHERE m.isActive = true")
    long countActive();
}
