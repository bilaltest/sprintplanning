package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.Release;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ReleaseRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ReleaseRepository releaseRepository;

    private Release release1;
    private Release release2;
    private Release release3;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();

        release1 = new Release();
        release1.setId("release-1");
        release1.setName("Release v40.5 - Sprint 2025.01");
        release1.setVersion("40.5");
        release1.setReleaseDate(now.plusDays(7));
        release1.setStatus("draft");
        release1.setType("release");
        release1.setDescription("January release");

        release2 = new Release();
        release2.setId("release-2");
        release2.setName("Hotfix 40.4.1");
        release2.setVersion("40.4.1");
        release2.setReleaseDate(now.minusDays(2));
        release2.setStatus("completed");
        release2.setType("hotfix");

        release3 = new Release();
        release3.setId("release-3");
        release3.setName("Release v41.0");
        release3.setVersion("41.0");
        release3.setReleaseDate(now.plusDays(30));
        release3.setStatus("in_progress");
        release3.setType("release");
    }

    @Test
    void shouldFindReleasesByStatus() {
        // Given
        entityManager.persist(release1);
        entityManager.persist(release2);
        entityManager.persist(release3);
        entityManager.flush();

        // When
        List<Release> draftReleases = releaseRepository.findByStatusOrderByReleaseDateDesc("draft");
        List<Release> completedReleases = releaseRepository.findByStatusOrderByReleaseDateDesc("completed");

        // Then
        assertThat(draftReleases).hasSize(1);
        assertThat(draftReleases.get(0).getName()).contains("v40.5");
        assertThat(completedReleases).hasSize(1);
    }

    @Test
    void shouldFindReleasesByType() {
        // Given
        entityManager.persist(release1);
        entityManager.persist(release2);
        entityManager.persist(release3);
        entityManager.flush();

        // When
        List<Release> releases = releaseRepository.findByTypeOrderByReleaseDateDesc("release");
        List<Release> hotfixes = releaseRepository.findByTypeOrderByReleaseDateDesc("hotfix");

        // Then
        assertThat(releases).hasSize(2);
        assertThat(hotfixes).hasSize(1);
        assertThat(hotfixes.get(0).getVersion()).isEqualTo("40.4.1");
    }

    @Test
    void shouldFindUpcomingReleases() {
        // Given
        entityManager.persist(release1);
        entityManager.persist(release2);
        entityManager.persist(release3);
        entityManager.flush();

        // When
        List<Release> upcoming = releaseRepository.findUpcomingReleases(LocalDateTime.now());

        // Then
        assertThat(upcoming).hasSize(2);
        assertThat(upcoming.get(0).getReleaseDate()).isAfter(LocalDateTime.now());
    }

    @Test
    void shouldFindPastReleases() {
        // Given
        entityManager.persist(release1);
        entityManager.persist(release2);
        entityManager.persist(release3);
        entityManager.flush();

        // When
        List<Release> past = releaseRepository.findPastReleases(LocalDateTime.now());

        // Then
        assertThat(past).hasSize(1);
        assertThat(past.get(0).getVersion()).isEqualTo("40.4.1");
    }

    @Test
    void shouldFindReleasesInDateRange() {
        // Given
        entityManager.persist(release1);
        entityManager.persist(release2);
        entityManager.persist(release3);
        entityManager.flush();

        LocalDateTime start = LocalDateTime.now().minusDays(10);
        LocalDateTime end = LocalDateTime.now().plusDays(20);

        // When
        List<Release> inRange = releaseRepository.findReleasesInDateRange(start, end);

        // Then
        assertThat(inRange).hasSize(2);
    }

    @Test
    void shouldOrderByReleaseDateDescending() {
        // Given
        entityManager.persist(release1);
        entityManager.persist(release2);
        entityManager.persist(release3);
        entityManager.flush();

        // When
        List<Release> all = releaseRepository.findAllByOrderByReleaseDateDesc();

        // Then
        assertThat(all).hasSize(3);
        assertThat(all.get(0).getVersion()).isEqualTo("41.0");
        assertThat(all.get(2).getVersion()).isEqualTo("40.4.1");
    }
}
