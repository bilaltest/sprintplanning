package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {

    /**
     * Find events by category
     */
    List<Event> findByCategory(String category);

    /**
     * Find events in a date range
     * Used for calendar view filtering
     */
    @Query("SELECT e FROM Event e WHERE e.date >= :startDate AND e.date <= :endDate ORDER BY e.date ASC, e.startTime ASC")
    List<Event> findEventsInDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);

    /**
     * Find events by date
     */
    List<Event> findByDateOrderByStartTimeAsc(String date);

    /**
     * Find events by category in date range
     */
    @Query("SELECT e FROM Event e WHERE e.category = :category AND e.date >= :startDate AND e.date <= :endDate ORDER BY e.date ASC, e.startTime ASC")
    List<Event> findByCategoryAndDateRange(
        @Param("category") String category,
        @Param("startDate") String startDate,
        @Param("endDate") String endDate
    );

    /**
     * Find all events ordered by date
     */
    List<Event> findAllByOrderByDateAscStartTimeAsc();

    /**
     * Find events older than cutoff date (for archiving)
     */
    @Query("SELECT e FROM Event e WHERE e.date < :cutoffDate")
    List<Event> findEventsOlderThan(@Param("cutoffDate") String cutoffDate);

    /**
     * Search events by title or description
     */
    @Query("SELECT e FROM Event e WHERE LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY e.date ASC")
    List<Event> searchByTitleOrDescription(@Param("search") String search);

    /**
     * Find events between two dates
     */
    @Query("SELECT e FROM Event e WHERE e.date >= :dateFrom AND e.date <= :dateTo ORDER BY e.date ASC")
    List<Event> findByDateBetween(@Param("dateFrom") String dateFrom, @Param("dateTo") String dateTo);

    /**
     * Find events after a date
     */
    @Query("SELECT e FROM Event e WHERE e.date >= :dateFrom ORDER BY e.date ASC")
    List<Event> findByDateAfter(@Param("dateFrom") String dateFrom);

    /**
     * Find events before a date
     */
    @Query("SELECT e FROM Event e WHERE e.date <= :dateTo ORDER BY e.date ASC")
    List<Event> findByDateBefore(@Param("dateTo") String dateTo);
}
