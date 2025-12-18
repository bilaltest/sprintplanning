package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.CreateMicroserviceRequest;
import com.catsbanque.mabanquetools.dto.MicroserviceDto;
import com.catsbanque.mabanquetools.dto.UpdateMicroserviceRequest;
import com.catsbanque.mabanquetools.entity.Microservice;
import com.catsbanque.mabanquetools.repository.MicroserviceRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MicroserviceService {

    private final MicroserviceRepository microserviceRepository;

    // Lazy injection to avoid circular dependency (MicroserviceService <->
    // ReleaseNoteService)
    @Lazy
    private final ReleaseNoteService releaseNoteService;

    /**
     * Initialize default microservices on application startup
     */
    /**
     * Initialize default microservices on application startup
     * Called by DataInitializer
     */
    public void initDefaultMicroservices() {
        if (microserviceRepository.count() > 0) {
            return; // Already initialized
        }

        // Default microservices grouped by squad
        List<MicroserviceData> defaultMicroservices = Arrays.asList(
                // Squad 1
                new MicroserviceData("api-gateway", "Squad 1", "Core Infrastructure", 0),
                new MicroserviceData("auth-service", "Squad 1", "Core Infrastructure", 1),
                new MicroserviceData("config-service", "Squad 1", "Core Infrastructure", 2),

                // Squad 2
                new MicroserviceData("user-service", "Squad 2", "User Management", 0),
                new MicroserviceData("profile-service", "Squad 2", "User Management", 1),

                // Squad 3
                new MicroserviceData("payment-service", "Squad 3", "Financial Services", 0),
                new MicroserviceData("transaction-service", "Squad 3", "Financial Services", 1),

                // Squad 4
                new MicroserviceData("notification-service", "Squad 4", "Communication", 0),
                new MicroserviceData("email-service", "Squad 4", "Communication", 1),

                // Squad 5
                new MicroserviceData("analytics-service", "Squad 5", "Data & Analytics", 0),
                new MicroserviceData("reporting-service", "Squad 5", "Data & Analytics", 1),

                // Squad 6
                new MicroserviceData("monitoring-service", "Squad 6", "DevOps", 0),
                new MicroserviceData("logging-service", "Squad 6", "DevOps", 1));

        for (MicroserviceData data : defaultMicroservices) {
            Microservice microservice = Microservice.builder()
                    .name(data.name)
                    .squad(data.squad)
                    .solution(data.solution)
                    .displayOrder(data.displayOrder)
                    .isActive(true)
                    .description("Microservice géré par " + data.squad)
                    .build();
            microserviceRepository.save(microservice);
        }
    }

    /**
     * Get all active microservices
     *
     * @param releaseId Optional release ID to compute previousTag for each
     *                  microservice
     */
    public List<MicroserviceDto> getAllActive(String releaseId) {
        List<Microservice> microservices = microserviceRepository.findAllActive();

        // Si releaseId fourni, charger les tags précédents en une seule query
        Map<String, String> previousTags = null;
        if (releaseId != null && !releaseId.isEmpty()) {
            log.info("Loading previous tags for releaseId: {}", releaseId);
            previousTags = releaseNoteService.getAllPreviousTags(releaseId);
            log.info("Found {} previous tags", previousTags.size());
            previousTags.forEach((msId, tag) -> log.info("  - {} -> {}", msId, tag));
        }

        // Convertir en DTO et enrichir avec previousTag
        final Map<String, String> finalPreviousTags = previousTags;
        return microservices.stream()
                .map(ms -> toDto(ms, finalPreviousTags))
                .collect(Collectors.toList());
    }

    /**
     * Get all microservices (including inactive)
     */
    public List<MicroserviceDto> getAll() {
        return microserviceRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get active microservices by squad
     */
    public List<MicroserviceDto> getActiveBySquad(String squad) {
        return microserviceRepository.findActiveBySquad(squad).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get microservice by ID
     */
    public MicroserviceDto getById(String id) {
        Microservice microservice = microserviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Microservice non trouvé: " + id));
        return toDto(microservice);
    }

    /**
     * Create new microservice
     */
    @Transactional
    public MicroserviceDto create(CreateMicroserviceRequest request) {
        // Check if name already exists
        if (microserviceRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Un microservice avec ce nom existe déjà: " + request.getName());
        }

        Microservice microservice = Microservice.builder()
                .name(request.getName())
                .squad(request.getSquad())
                .solution(request.getSolution())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .description(request.getDescription())
                .isActive(true)
                .build();

        microservice = microserviceRepository.save(microservice);
        return toDto(microservice);
    }

    /**
     * Update microservice
     */
    @Transactional
    public MicroserviceDto update(String id, UpdateMicroserviceRequest request) {
        Microservice microservice = microserviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Microservice non trouvé: " + id));

        // Check if new name conflicts with existing microservice
        if (request.getName() != null &&
                !request.getName().equals(microservice.getName()) &&
                microserviceRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new RuntimeException("Un microservice avec ce nom existe déjà: " + request.getName());
        }

        if (request.getName() != null) {
            microservice.setName(request.getName());
        }
        if (request.getSquad() != null) {
            microservice.setSquad(request.getSquad());
        }
        if (request.getSolution() != null) {
            microservice.setSolution(request.getSolution());
        }
        if (request.getDisplayOrder() != null) {
            microservice.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsActive() != null) {
            microservice.setIsActive(request.getIsActive());
        }
        if (request.getDescription() != null) {
            microservice.setDescription(request.getDescription());
        }

        microservice = microserviceRepository.save(microservice);
        return toDto(microservice);
    }

    /**
     * Delete (soft delete) microservice
     */
    @Transactional
    public void delete(String id) {
        Microservice microservice = microserviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Microservice non trouvé: " + id));

        // Soft delete
        microservice.setIsActive(false);
        microserviceRepository.save(microservice);
    }

    /**
     * Hard delete microservice (use with caution!)
     */
    @Transactional
    public void hardDelete(String id) {
        if (!microserviceRepository.existsById(id)) {
            throw new RuntimeException("Microservice non trouvé: " + id);
        }
        microserviceRepository.deleteById(id);
    }

    /**
     * Convert entity to DTO (without previousTag)
     */
    private MicroserviceDto toDto(Microservice microservice) {
        return toDto(microservice, null);
    }

    /**
     * Convert entity to DTO with optional previousTag enrichment
     *
     * @param microservice The microservice entity
     * @param previousTags Map of microserviceId -> previousTag (nullable)
     */
    private MicroserviceDto toDto(Microservice microservice, Map<String, String> previousTags) {
        String previousTag = null;
        if (previousTags != null && microservice.getId() != null) {
            previousTag = previousTags.get(microservice.getId());
        }

        return MicroserviceDto.builder()
                .id(microservice.getId())
                .name(microservice.getName())
                .squad(microservice.getSquad())
                .solution(microservice.getSolution())
                .displayOrder(microservice.getDisplayOrder())
                .isActive(microservice.getIsActive())
                .description(microservice.getDescription())
                .previousTag(previousTag)
                .build();
    }

    /**
     * Helper class for initializing default microservices
     */
    private static class MicroserviceData {
        String name;
        String squad;
        String solution;
        int displayOrder;

        MicroserviceData(String name, String squad, String solution, int displayOrder) {
            this.name = name;
            this.squad = squad;
            this.solution = solution;
            this.displayOrder = displayOrder;
        }
    }
}
