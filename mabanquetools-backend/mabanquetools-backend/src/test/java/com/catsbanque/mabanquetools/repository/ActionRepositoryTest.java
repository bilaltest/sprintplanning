package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.Action;
import com.catsbanque.mabanquetools.entity.Release;
import com.catsbanque.mabanquetools.entity.Squad;
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
class ActionRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ActionRepository actionRepository;

    private Squad squad;
    private Action action1;
    private Action action2;
    private Action action3;

    @BeforeEach
    void setUp() {
        Release release = new Release();
        release.setId("release-1");
        release.setName("Release v40.5 - Sprint 2025.01");
        release.setReleaseDate(LocalDateTime.now().plusDays(7));
        release.setStatus("draft");
        release.setType("release");

        squad = new Squad();
        squad.setId("squad-1");
        squad.setRelease(release);
        squad.setSquadNumber(1);
        squad.setTontonMep("Jean D.");
        squad.setIsCompleted(false);
        squad.setFeaturesEmptyConfirmed(false);
        squad.setPreMepEmptyConfirmed(false);
        squad.setPostMepEmptyConfirmed(false);

        action1 = new Action();
        action1.setId("action-1");
        action1.setSquadId("squad-1");
        action1.setPhase("pre_mep");
        action1.setType("database_update");
        action1.setTitle("Update schema v40.5");
        action1.setStatus("pending");
        action1.setOrder(1);

        action2 = new Action();
        action2.setId("action-2");
        action2.setSquadId("squad-1");
        action2.setPhase("pre_mep");
        action2.setType("feature_flipping");
        action2.setTitle("Enable FF_NEW_FEATURE");
        action2.setStatus("completed");
        action2.setOrder(2);

        action3 = new Action();
        action3.setId("action-3");
        action3.setSquadId("squad-1");
        action3.setPhase("post_mep");
        action3.setType("other");
        action3.setTitle("Verify deployment");
        action3.setStatus("pending");
        action3.setOrder(1);

        entityManager.persist(release);
        entityManager.persist(squad);
    }

    @Test
    void shouldFindActionsBySquadId() {
        // Given
        entityManager.persist(action1);
        entityManager.persist(action2);
        entityManager.persist(action3);
        entityManager.flush();

        // When
        List<Action> actions = actionRepository.findBySquadIdOrderByOrderAsc("squad-1");

        // Then
        assertThat(actions).hasSize(3);
        assertThat(actions.get(0).getOrder()).isEqualTo(1);
    }

    @Test
    void shouldFindActionsByPhase() {
        // Given
        entityManager.persist(action1);
        entityManager.persist(action2);
        entityManager.persist(action3);
        entityManager.flush();

        // When
        List<Action> preMepActions = actionRepository.findBySquadIdAndPhaseOrderByOrderAsc(
            "squad-1", "pre_mep"
        );
        List<Action> postMepActions = actionRepository.findBySquadIdAndPhaseOrderByOrderAsc(
            "squad-1", "post_mep"
        );

        // Then
        assertThat(preMepActions).hasSize(2);
        assertThat(postMepActions).hasSize(1);
    }

    @Test
    void shouldFindActionsByStatus() {
        // Given
        entityManager.persist(action1);
        entityManager.persist(action2);
        entityManager.persist(action3);
        entityManager.flush();

        // When
        List<Action> pendingActions = actionRepository.findBySquadIdAndStatusOrderByOrderAsc(
            "squad-1", "pending"
        );
        List<Action> completedActions = actionRepository.findBySquadIdAndStatusOrderByOrderAsc(
            "squad-1", "completed"
        );

        // Then
        assertThat(pendingActions).hasSize(2);
        assertThat(completedActions).hasSize(1);
    }

    @Test
    void shouldCountActionsByStatus() {
        // Given
        entityManager.persist(action1);
        entityManager.persist(action2);
        entityManager.persist(action3);
        entityManager.flush();

        // When
        long completedCount = actionRepository.countBySquadIdAndStatus("squad-1", "completed");
        long totalCount = actionRepository.countBySquadId("squad-1");

        // Then
        assertThat(completedCount).isEqualTo(1);
        assertThat(totalCount).isEqualTo(3);
    }

    @Test
    void shouldRespectActionOrdering() {
        // Given
        entityManager.persist(action2);
        entityManager.persist(action1);
        entityManager.flush();

        // When
        List<Action> actions = actionRepository.findBySquadIdOrderByOrderAsc("squad-1");

        // Then
        assertThat(actions).hasSize(2);
        assertThat(actions.get(0).getOrder()).isEqualTo(1);
        assertThat(actions.get(1).getOrder()).isEqualTo(2);
    }
}
