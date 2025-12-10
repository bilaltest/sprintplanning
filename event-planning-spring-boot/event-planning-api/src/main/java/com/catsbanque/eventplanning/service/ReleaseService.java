package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.CreateReleaseRequest;
import com.catsbanque.eventplanning.dto.ReleaseDto;
import com.catsbanque.eventplanning.entity.Release;
import com.catsbanque.eventplanning.entity.Squad;
import com.catsbanque.eventplanning.exception.ResourceNotFoundException;
import com.catsbanque.eventplanning.repository.ReleaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service de gestion des releases
 * Référence: release.controller.js
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReleaseService {

    private final ReleaseRepository releaseRepository;

    /**
     * Récupérer toutes les releases (futures + 20 dernières passées)
     * Référence: release.controller.js:75-152
     *
     * Note: L'archivage automatique a été déplacé vers ArchiveScheduler (tâche planifiée à 3h)
     * pour éviter de bloquer les requêtes GET avec des DELETE synchrones (cascade sur Squads/Features/Actions)
     */
    @Transactional(readOnly = true)
    public List<ReleaseDto> getAllReleases() {
        // Archivage automatique → Déplacé vers ArchiveScheduler.archivePastReleases()

        LocalDateTime now = LocalDateTime.now();

        // Récupérer toutes les releases à venir
        List<Release> upcomingReleases = releaseRepository.findByReleaseDateAfter(now);

        // Récupérer les 20 dernières releases passées
        List<Release> pastReleases = releaseRepository
                .findTop20ByReleaseDateBeforeOrderByReleaseDateDesc(now);

        // Combiner les releases
        List<Release> allReleases = new ArrayList<>();
        allReleases.addAll(upcomingReleases);
        allReleases.addAll(pastReleases);

        return allReleases.stream()
                .map(ReleaseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer une release par ID ou version
     * Référence: release.controller.js:155-217
     */
    @Transactional(readOnly = true)
    public ReleaseDto getReleaseByIdOrVersion(String idOrVersion) {
        // Essayer d'abord par version
        Release release = releaseRepository.findByVersion(idOrVersion)
                .orElse(null);

        // Si pas trouvé par version, essayer par ID
        if (release == null) {
            release = releaseRepository.findById(idOrVersion)
                    .orElseThrow(() -> new ResourceNotFoundException("Release not found"));
        }

        // Force le chargement des squads (eager loading)
        release.getSquads().size();

        return ReleaseDto.fromEntity(release);
    }

    /**
     * Créer une nouvelle release avec 6 squads par défaut
     * Référence: release.controller.js:220-267
     */
    @Transactional
    public ReleaseDto createRelease(CreateReleaseRequest request) {
        Release release = new Release();
        release.setName(request.getName());
        release.setVersion(request.getVersion());
        release.setReleaseDate(request.getReleaseDate());
        release.setType(request.getType() != null ? request.getType() : "release");
        release.setDescription(request.getDescription());
        release.setStatus("draft");

        // Créer 6 squads par défaut
        List<Squad> squads = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            Squad squad = new Squad();
            squad.setSquadNumber(i);
            squad.setIsCompleted(false);
            squad.setFeaturesEmptyConfirmed(false);
            squad.setPreMepEmptyConfirmed(false);
            squad.setPostMepEmptyConfirmed(false);
            squad.setRelease(release);
            squads.add(squad);
        }
        release.setSquads(squads);

        Release saved = releaseRepository.save(release);
        log.info("Release created: {}", saved.getId());
        return ReleaseDto.fromEntity(saved);
    }

    /**
     * Mettre à jour une release
     * Référence: release.controller.js:270-306
     */
    @Transactional
    public ReleaseDto updateRelease(String id, CreateReleaseRequest request) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Release not found"));

        release.setName(request.getName());
        release.setVersion(request.getVersion());
        release.setReleaseDate(request.getReleaseDate());
        release.setType(request.getType() != null ? request.getType() : release.getType());
        release.setDescription(request.getDescription());

        Release updated = releaseRepository.save(release);
        log.info("Release updated: {}", updated.getId());
        return ReleaseDto.fromEntity(updated);
    }

    /**
     * Mettre à jour le statut d'une release
     * Référence: release.controller.js:309-329
     */
    @Transactional
    public ReleaseDto updateReleaseStatus(String id, String status) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Release not found"));

        release.setStatus(status);
        Release updated = releaseRepository.save(release);
        log.info("Release status updated: {} -> {}", updated.getId(), status);
        return ReleaseDto.fromEntity(updated);
    }

    /**
     * Supprimer une release
     * Référence: release.controller.js:332-345
     */
    @Transactional
    public void deleteRelease(String id) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Release not found"));

        releaseRepository.delete(release);
        log.info("Release deleted: {}", id);
    }
}
