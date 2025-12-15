package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.UpdateReleaseRequest;
import com.catsbanque.eventplanning.dto.CreateReleaseRequest;
import com.catsbanque.eventplanning.dto.ReleaseDto;
import com.catsbanque.eventplanning.entity.Release;
import com.catsbanque.eventplanning.entity.Squad;
import com.catsbanque.eventplanning.exception.ResourceNotFoundException;
import com.catsbanque.eventplanning.repository.ReleaseRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
     * Migration automatique des slugs pour les releases existantes
     * Exécuté au démarrage de l'application
     */
    @PostConstruct
    @Transactional
    public void migrateSlugs() {
        List<Release> releasesWithoutSlug = releaseRepository.findAll().stream()
                .filter(r -> r.getSlug() == null || r.getSlug().isEmpty())
                .collect(Collectors.toList());

        if (!releasesWithoutSlug.isEmpty()) {
            log.info("Migration des slugs: {} releases sans slug trouvées", releasesWithoutSlug.size());

            for (Release release : releasesWithoutSlug) {
                // Le slug sera généré automatiquement par @PreUpdate
                release.setUpdatedAt(LocalDateTime.now());
                releaseRepository.save(release);
                log.debug("Slug généré pour release: {} -> {}", release.getName(), release.getSlug());
            }

            log.info("Migration des slugs terminée: {} slugs générés", releasesWithoutSlug.size());
        }
    }

    /**
     * Récupérer toutes les releases (futures + 20 dernières passées)
     * Référence: release.controller.js:75-152
     *
     * Note: L'archivage automatique a été déplacé vers ArchiveScheduler (tâche
     * planifiée à 3h)
     * pour éviter de bloquer les requêtes GET avec des DELETE synchrones (cascade
     * sur Squads/Features/Actions)
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
     * Récupérer une release par ID ou slug
     * Référence: release.controller.js:155-217
     */
    @Transactional(readOnly = true)
    public ReleaseDto getReleaseById(String identifier) {
        // Essayer d'abord par slug, puis par ID (rétrocompatibilité)
        Release release = releaseRepository.findBySlug(identifier)
                .or(() -> releaseRepository.findById(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("Release not found"));

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
        release.setReleaseDate(parseReleaseDate(request.getReleaseDate()));
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
    public ReleaseDto updateRelease(String identifier, UpdateReleaseRequest request) {
        Release release = releaseRepository.findBySlug(identifier)
                .or(() -> releaseRepository.findById(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("Release not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            release.setName(request.getName());
            // Le slug sera automatiquement regénéré par @PreUpdate
        }

        if (request.getReleaseDate() != null && !request.getReleaseDate().isBlank()) {
            release.setReleaseDate(parseReleaseDate(request.getReleaseDate()));
        }

        if (request.getType() != null) {
            release.setType(request.getType());
        }

        if (request.getDescription() != null) {
            release.setDescription(request.getDescription());
        }

        if (request.getStatus() != null) {
            release.setStatus(request.getStatus());
        }

        Release updated = releaseRepository.save(release);
        log.info("Release updated: {}", updated.getId());
        return ReleaseDto.fromEntity(updated);
    }

    /**
     * Mettre à jour le statut d'une release
     * Référence: release.controller.js:309-329
     */
    @Transactional
    public ReleaseDto updateReleaseStatus(String identifier, String status) {
        Release release = releaseRepository.findBySlug(identifier)
                .or(() -> releaseRepository.findById(identifier))
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
    public void deleteRelease(String identifier) {
        // Accepter slug ou ID
        Release release = releaseRepository.findBySlug(identifier)
                .or(() -> releaseRepository.findById(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("Release not found"));

        releaseRepository.delete(release);
        log.info("Release deleted: {}", identifier);
    }

    /**
     * Parse une date string en LocalDateTime.
     * Supporte les formats:
     * - ISO 8601 avec timezone: "2025-01-15T10:00:00.000Z"
     * - ISO sans timezone: "2025-01-15T10:00:00"
     * - Date seule: "2025-01-15" (heure mise à 00:00)
     */
    private LocalDateTime parseReleaseDate(String dateString) {
        if (dateString == null || dateString.isEmpty()) {
            throw new IllegalArgumentException("Release date cannot be null or empty");
        }

        try {
            // Essayer de parser comme ISO 8601 avec timezone (ex: 2025-01-15T10:00:00.000Z)
            if (dateString.contains("Z") || dateString.contains("+")) {
                return ZonedDateTime.parse(dateString).toLocalDateTime();
            }

            // Essayer de parser comme LocalDateTime (ex: 2025-01-15T10:00:00)
            if (dateString.contains("T")) {
                return LocalDateTime.parse(dateString);
            }

            // Parser comme LocalDate et convertir en LocalDateTime à minuit (ex:
            // 2025-01-15)
            return java.time.LocalDate.parse(dateString).atStartOfDay();

        } catch (DateTimeParseException e) {
            log.error("Erreur de parsing de la date: {}", dateString, e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Format de date invalide: " + dateString
                    + ". Formats acceptés: yyyy-MM-dd ou yyyy-MM-dd'T'HH:mm:ss", e);
        }
    }
}
