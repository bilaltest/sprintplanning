package com.catsbanque.eventplanning.repository;

import com.catsbanque.eventplanning.entity.Release;
import com.catsbanque.eventplanning.entity.Squad;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class SquadRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SquadRepository squadRepository;

    private Release release;
    private Squad squad1;
    private Squad squad2;

    @BeforeEach
    void setUp() {
        release = new Release();
        release.setId("release-1");
        release.setName("Release v40.5 - Sprint 2025.01");
        release.setReleaseDate(LocalDateTime.now().plusDays(7));
        release.setStatus("draft");
        release.setType("release");

        squad1 = new Squad();
        squad1.setId("squad-1");
        squad1.setRelease(release);
        squad1.setSquadNumber(1);
        squad1.setTontonMep("Jean D.");
        squad1.setIsCompleted(false);
        squad1.setFeaturesEmptyConfirmed(false);
        squad1.setPreMepEmptyConfirmed(false);
        squad1.setPostMepEmptyConfirmed(false);

        squad2 = new Squad();
        squad2.setId("squad-2");
        squad2.setRelease(release);
        squad2.setSquadNumber(2);
        squad2.setTontonMep("Marie L.");
        squad2.setIsCompleted(true);
        squad2.setFeaturesEmptyConfirmed(true);
        squad2.setPreMepEmptyConfirmed(true);
        squad2.setPostMepEmptyConfirmed(true);
    }

    @Test
    void shouldFindSquadsByReleaseId() {
        // Given
        entityManager.persist(release);
        entityManager.persist(squad1);
        entityManager.persist(squad2);
        entityManager.flush();

        // When
        List<Squad> squads = squadRepository.findByReleaseIdOrderBySquadNumberAsc("release-1");

        // Then
        assertThat(squads).hasSize(2);
        assertThat(squads.get(0).getSquadNumber()).isEqualTo(1);
        assertThat(squads.get(1).getSquadNumber()).isEqualTo(2);
    }

    @Test
    void shouldFindSquadByReleaseIdAndSquadNumber() {
        // Given
        entityManager.persist(release);
        entityManager.persist(squad1);
        entityManager.persist(squad2);
        entityManager.flush();

        // When
        Optional<Squad> found = squadRepository.findByReleaseIdAndSquadNumber("release-1", 1);

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getTontonMep()).isEqualTo("Jean D.");
    }

    @Test
    void shouldFindCompletedSquads() {
        // Given
        entityManager.persist(release);
        entityManager.persist(squad1);
        entityManager.persist(squad2);
        entityManager.flush();

        // When
        List<Squad> completed = squadRepository.findByReleaseIdAndIsCompletedOrderBySquadNumberAsc(
            "release-1", true
        );

        // Then
        assertThat(completed).hasSize(1);
        assertThat(completed.get(0).getSquadNumber()).isEqualTo(2);
        assertThat(completed.get(0).getTontonMep()).isEqualTo("Marie L.");
    }

    @Test
    void shouldReturnEmptyWhenSquadNotFound() {
        // When
        Optional<Squad> found = squadRepository.findByReleaseIdAndSquadNumber("release-1", 99);

        // Then
        assertThat(found).isEmpty();
    }
}
