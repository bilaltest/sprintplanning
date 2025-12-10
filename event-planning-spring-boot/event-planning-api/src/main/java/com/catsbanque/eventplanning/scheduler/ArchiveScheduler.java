package com.catsbanque.eventplanning.scheduler;

import com.catsbanque.eventplanning.entity.Event;
import com.catsbanque.eventplanning.entity.Release;
import com.catsbanque.eventplanning.repository.EventRepository;
import com.catsbanque.eventplanning.repository.ReleaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Scheduler pour l'archivage automatique des anciennes données
 * Exécute quotidiennement à 3h du matin pour nettoyer la base de données
 * sans impacter les performances des requêtes utilisateur
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ArchiveScheduler {

    private final EventRepository eventRepository;
    private final ReleaseRepository releaseRepository;

    /**
     * Archivage quotidien à 3h du matin
     * Cron expression: "seconde minute heure jour mois jour-semaine"
     *                  "0      0      3     *    *    *"
     *
     * Pour tester en dev, changer à: @Scheduled(cron = "0 * * * * *") (toutes les minutes)
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void archiveOldData() {
        log.info("=== Démarrage archivage automatique ===");
        long startTime = System.currentTimeMillis();

        int archivedEvents = archiveOldEvents();
        int archivedReleases = archivePastReleases();

        long duration = System.currentTimeMillis() - startTime;

        log.info("=== Archivage terminé en {}ms ===", duration);
        log.info("Événements archivés : {}", archivedEvents);
        log.info("Releases archivées : {}", archivedReleases);
    }

    /**
     * Archive les événements de plus de 24 mois
     * Référence: EventService.archiveOldEvents() (event.controller.js:6-29)
     *
     * @return nombre d'événements archivés
     */
    private int archiveOldEvents() {
        try {
            LocalDate cutoffDate = LocalDate.now().minusMonths(24);
            String cutoffDateString = cutoffDate.toString(); // Format YYYY-MM-DD

            List<Event> oldEvents = eventRepository.findEventsOlderThan(cutoffDateString);

            if (!oldEvents.isEmpty()) {
                eventRepository.deleteAll(oldEvents);
                log.info("Supprimé {} événements antérieurs à {}", oldEvents.size(), cutoffDate);
                return oldEvents.size();
            } else {
                log.debug("Aucun événement à archiver (cutoff: {})", cutoffDate);
                return 0;
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'archivage des événements", e);
            return 0;
        }
    }

    /**
     * Archive les releases passées au-delà de 20
     * Garde seulement les 20 releases passées les plus récentes
     * Référence: ReleaseService.archivePastReleases() (release.controller.js:27-72)
     *
     * @return nombre de releases archivées
     */
    private int archivePastReleases() {
        try {
            LocalDateTime now = LocalDateTime.now();

            // Compter les releases passées
            long pastReleasesCount = releaseRepository.countByReleaseDateBefore(now);

            // Si on dépasse 20, supprimer les plus anciennes
            if (pastReleasesCount > 20) {
                List<Release> releasesToDelete = releaseRepository
                        .findByReleaseDateBeforeOrderByReleaseDateAsc(now);

                int toDelete = (int) (pastReleasesCount - 20);
                List<Release> oldestReleases = releasesToDelete.stream()
                        .limit(toDelete)
                        .collect(Collectors.toList());

                releaseRepository.deleteAll(oldestReleases);
                log.info("Supprimé {} releases (conservé les 20 plus récentes, total passées: {})",
                        toDelete, pastReleasesCount);
                return toDelete;
            } else {
                log.debug("Aucune release à archiver (passées: {}, limite: 20)", pastReleasesCount);
                return 0;
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'archivage des releases", e);
            return 0;
        }
    }
}
