package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.ReleaseHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReleaseHistoryRepository extends JpaRepository<ReleaseHistory, String> {

    /**
     * Find release history by release ID
     */
    List<ReleaseHistory> findByReleaseIdOrderByTimestampDesc(String releaseId);

    /**
     * Find release history by user ID
     */
    List<ReleaseHistory> findByUserIdOrderByTimestampDesc(String userId);

    /**
     * Find release history in date range
     */
    List<ReleaseHistory> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);

    /**
     * Find all release history ordered by timestamp descending
     */
    List<ReleaseHistory> findAllByOrderByTimestampDesc();

    /**
     * Find release history by action type
     */
    List<ReleaseHistory> findByActionOrderByTimestampDesc(String action);

    /**
     * Find last 30 entries ordered by timestamp descending
     * Used for GET /api/release-history
     */
    @Query("SELECT rh FROM ReleaseHistory rh ORDER BY rh.timestamp DESC")
    default List<ReleaseHistory> findLast30Entries() {
        return findAllByOrderByTimestampDesc().stream()
                .limit(30)
                .toList();
    }

    /**
     * Find oldest entries for archiving
     * Used to delete entries beyond the 30 most recent
     */
    @Query("SELECT rh FROM ReleaseHistory rh ORDER BY rh.timestamp ASC")
    default List<ReleaseHistory> findOldestEntries(int count) {
        return findAllByOrderByTimestampAsc().stream()
                .limit(count)
                .toList();
    }

    /**
     * Find all release history ordered by timestamp ascending
     */
    List<ReleaseHistory> findAllByOrderByTimestampAsc();
}
