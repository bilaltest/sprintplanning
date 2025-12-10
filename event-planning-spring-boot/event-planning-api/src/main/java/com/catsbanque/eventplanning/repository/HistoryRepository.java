package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.History;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HistoryRepository extends JpaRepository<History, String> {

    /**
     * Find history by event ID
     */
    List<History> findByEventIdOrderByTimestampDesc(String eventId);

    /**
     * Find history by user ID
     */
    List<History> findByUserIdOrderByTimestampDesc(String userId);

    /**
     * Find history in date range
     */
    List<History> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);

    /**
     * Find all history ordered by timestamp descending
     */
    List<History> findAllByOrderByTimestampDesc();

    /**
     * Find history by action type
     */
    List<History> findByActionOrderByTimestampDesc(String action);

    /**
     * Find last 30 entries ordered by timestamp descending
     * Used for GET /api/history
     */
    @Query("SELECT h FROM History h ORDER BY h.timestamp DESC")
    default List<History> findLast30Entries() {
        return findAllByOrderByTimestampDesc().stream()
                .limit(30)
                .toList();
    }

    /**
     * Find oldest entries for archiving
     * Used to delete entries beyond the 30 most recent
     */
    @Query("SELECT h FROM History h ORDER BY h.timestamp ASC")
    default List<History> findOldestEntries(int count) {
        return findAllByOrderByTimestampAsc().stream()
                .limit(count)
                .toList();
    }

    /**
     * Find all history ordered by timestamp ascending
     */
    List<History> findAllByOrderByTimestampAsc();
}
