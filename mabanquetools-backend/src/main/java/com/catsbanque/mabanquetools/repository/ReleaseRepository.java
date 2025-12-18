package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.Release;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReleaseRepository extends JpaRepository<Release, String> {

    /**
     * Find releases by status
     */
    List<Release> findByStatusOrderByReleaseDateDesc(String status);

    /**
     * Find releases by type
     */
    List<Release> findByTypeOrderByReleaseDateDesc(String type);

    /**
     * Find releases in date range
     */
    @Query("SELECT r FROM Release r WHERE r.releaseDate >= :startDate AND r.releaseDate <= :endDate ORDER BY r.releaseDate DESC")
    List<Release> findReleasesInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * Find all releases ordered by date descending
     */
    List<Release> findAllByOrderByReleaseDateDesc();

    /**
     * Find upcoming releases (after today)
     */
    @Query("SELECT r FROM Release r WHERE r.releaseDate >= :today ORDER BY r.releaseDate ASC")
    List<Release> findUpcomingReleases(@Param("today") LocalDateTime today);

    /**
     * Find past releases (before today)
     */
    @Query("SELECT r FROM Release r WHERE r.releaseDate < :today ORDER BY r.releaseDate DESC")
    List<Release> findPastReleases(@Param("today") LocalDateTime today);

    /**
     * Find by ID with relations
     */
    @Query("SELECT r FROM Release r LEFT JOIN FETCH r.squads WHERE r.id = :id")
    Optional<Release> findById(@Param("id") String id);

    /**
     * Find by slug (URL-friendly identifier)
     */
    @Query("SELECT r FROM Release r LEFT JOIN FETCH r.squads WHERE r.slug = :slug")
    Optional<Release> findBySlug(@Param("slug") String slug);

    /**
     * Find releases after date
     */
    List<Release> findByReleaseDateAfter(LocalDateTime date);

    /**
     * Find releases before date ordered ascending
     */
    List<Release> findByReleaseDateBeforeOrderByReleaseDateAsc(LocalDateTime date);

    /**
     * Count releases before date
     */
    long countByReleaseDateBefore(LocalDateTime date);

    /**
     * Find top 20 past releases
     */
    List<Release> findTop20ByReleaseDateBeforeOrderByReleaseDateDesc(LocalDateTime date);
}
