package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.Absence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AbsenceRepository extends JpaRepository<Absence, String> {

        List<Absence> findByUserId(String userId);

        @Query("SELECT a FROM Absence a WHERE a.startDate <= :endDate AND a.endDate >= :startDate")
        List<Absence> findByDateRange(LocalDate startDate, LocalDate endDate);

        @Query("SELECT a FROM Absence a WHERE a.user.id = :userId AND a.startDate <= :endDate AND a.endDate >= :startDate")
        List<Absence> findByUserIdAndDateRange(String userId, LocalDate startDate, LocalDate endDate);

        // Pour éviter les chevauchements pour un même utilisateur (sauf si même ID =
        // update)
        @Query("SELECT count(a) > 0 FROM Absence a WHERE a.user.id = :userId AND a.id != :excludeId " +
                        "AND a.startDate <= :endDate AND a.endDate >= :startDate " +
                        "AND NOT (a.endDate = :startDate AND a.endPeriod = 'MORNING' AND :startPeriod = 'AFTERNOON') " +
                        "AND NOT (a.startDate = :endDate AND a.startPeriod = 'AFTERNOON' AND :endPeriod = 'MORNING')")
        boolean existsOverlappingAbsence(String userId, String excludeId, LocalDate startDate, LocalDate endDate,
                        String startPeriod, String endPeriod);
}
