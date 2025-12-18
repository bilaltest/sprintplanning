package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.AdminStats;
import com.catsbanque.eventplanning.dto.AdminStatsResponse;
import com.catsbanque.eventplanning.dto.AdminUserDto;
import com.catsbanque.eventplanning.dto.AdminUsersResponse;
import com.catsbanque.eventplanning.dto.DatabaseExportDto;
import com.catsbanque.eventplanning.dto.DatabaseImportRequest;
import com.catsbanque.eventplanning.dto.DeletedUserInfo;
import com.catsbanque.eventplanning.dto.DeletedUserResponse;
import com.catsbanque.eventplanning.dto.ExportData;
import com.catsbanque.eventplanning.dto.ExportMetadata;
import com.catsbanque.eventplanning.dto.ImportDatabaseResponse;
import com.catsbanque.eventplanning.dto.TotalRecords;
import com.catsbanque.eventplanning.entity.Event;
import com.catsbanque.eventplanning.entity.History;
import com.catsbanque.eventplanning.entity.PermissionLevel;
import com.catsbanque.eventplanning.entity.PermissionModule;
import com.catsbanque.eventplanning.entity.Release;
import com.catsbanque.eventplanning.entity.ReleaseHistory;
import com.catsbanque.eventplanning.entity.Settings;
import com.catsbanque.eventplanning.entity.User;
import com.catsbanque.eventplanning.exception.BadRequestException;
import com.catsbanque.eventplanning.exception.ResourceNotFoundException;
import com.catsbanque.eventplanning.repository.ActionRepository;
import com.catsbanque.eventplanning.repository.EventRepository;
import com.catsbanque.eventplanning.repository.FeatureFlippingRepository;
import com.catsbanque.eventplanning.repository.FeatureRepository;
import com.catsbanque.eventplanning.repository.HistoryRepository;
import com.catsbanque.eventplanning.repository.ReleaseHistoryRepository;
import com.catsbanque.eventplanning.repository.ReleaseRepository;
import com.catsbanque.eventplanning.repository.SettingsRepository;
import com.catsbanque.eventplanning.repository.SquadRepository;
import com.catsbanque.eventplanning.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service d'administration
 * Référence: admin.controller.js
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final ReleaseRepository releaseRepository;
    private final HistoryRepository historyRepository;
    private final ReleaseHistoryRepository releaseHistoryRepository;
    private final SettingsRepository settingsRepository;
    private final SquadRepository squadRepository;
    private final FeatureRepository featureRepository;
    private final ActionRepository actionRepository;
    private final FeatureFlippingRepository featureFlippingRepository;
    private final ObjectMapper objectMapper;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final PermissionService permissionService;

    /**
     * Récupérer tous les utilisateurs
     * Référence: admin.controller.js:9-36
     */
    @Transactional(readOnly = true)
    public AdminUsersResponse getAllUsers() {
        List<User> users = userRepository.findAllByOrderByCreatedAtDesc();

        List<AdminUserDto> userDtos = users.stream()
                .map(user -> {
                    // Count histories
                    long historyCount = historyRepository.findByUserIdOrderByTimestampDesc(user.getId()).size();

                    // Get permissions
                    Map<PermissionModule, PermissionLevel> permissions = permissionService
                            .getUserPermissions(user.getId());

                    return AdminUserDto.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .themePreference(user.getThemePreference())
                            .createdAt(user.getCreatedAt())
                            .updatedAt(user.getUpdatedAt())
                            .historiesCount(historyCount)
                            .permissions(permissions)
                            .build();
                })
                .collect(Collectors.toList());

        return new AdminUsersResponse(userDtos);
    }

    /**
     * Supprimer un utilisateur
     * Référence: admin.controller.js:44-83
     */
    @Transactional
    public DeletedUserResponse deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // Mettre à jour les entrées d'historique pour remplacer le nom par "Deleted
        // User"
        List<History> histories = historyRepository.findByUserIdOrderByTimestampDesc(id);
        histories.forEach(h -> h.setUserDisplayName("Deleted User"));
        historyRepository.saveAll(histories);

        List<ReleaseHistory> releaseHistories = releaseHistoryRepository.findByUserIdOrderByTimestampDesc(id);
        releaseHistories.forEach(rh -> rh.setUserDisplayName("Deleted User"));
        releaseHistoryRepository.saveAll(releaseHistories);

        // Supprimer l'utilisateur
        userRepository.delete(user);

        log.info("Deleted user: {} {}", user.getFirstName(), user.getLastName());

        DeletedUserInfo deletedUser = new DeletedUserInfo(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName());

        return new DeletedUserResponse("Utilisateur supprimé avec succès", deletedUser);
    }

    /**
     * Récupérer des statistiques
     * Référence: admin.controller.js:89-115
     */
    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalEvents = eventRepository.count();
        long totalReleases = releaseRepository.count();
        long totalHistoryEntries = historyRepository.count();

        AdminStats stats = new AdminStats(totalUsers, totalEvents, totalReleases, totalHistoryEntries);
        return new AdminStatsResponse(stats);
    }

    /**
     * Exporter la base de données
     * Référence: admin.controller.js:121-191
     */
    @Transactional(readOnly = true)
    public DatabaseExportDto exportDatabase() {
        // Exporter toutes les données
        List<User> users = userRepository.findAll();
        List<Event> events = eventRepository.findAll();
        List<Release> releases = releaseRepository.findAll();
        List<History> history = historyRepository.findAll();
        List<ReleaseHistory> releaseHistory = releaseHistoryRepository.findAll();
        List<Settings> settings = settingsRepository.findAll();

        // Créer les métadonnées
        ExportMetadata metadata = new ExportMetadata();
        metadata.setExportDate(LocalDateTime.now().toString());
        metadata.setVersion("1.0");

        TotalRecords totalRecords = new TotalRecords();
        totalRecords.setUsers(users.size());
        totalRecords.setEvents(events.size());
        totalRecords.setReleases(releases.size());
        totalRecords.setHistory(history.size());
        totalRecords.setReleaseHistory(releaseHistory.size());
        totalRecords.setSettings(settings.size());
        metadata.setTotalRecords(totalRecords);

        // Créer les données d'export
        ExportData exportData = new ExportData();
        exportData.setUsers(users);
        exportData.setEvents(events);
        exportData.setReleases(releases);
        exportData.setHistory(history);
        exportData.setReleaseHistory(releaseHistory);
        exportData.setSettings(settings);

        DatabaseExportDto export = new DatabaseExportDto();
        export.setMetadata(metadata);
        export.setData(exportData);

        log.info("Database exported with {} total records",
                totalRecords.getUsers() + totalRecords.getEvents() + totalRecords.getReleases());

        return export;
    }

    /**
     * Importer la base de données
     * Référence: admin.controller.js:198-318
     * ATTENTION: Écrase toutes les données existantes
     */
    @Transactional
    public ImportDatabaseResponse importDatabase(DatabaseImportRequest request) {
        if (request.getData() == null || request.getMetadata() == null) {
            throw new BadRequestException("Format de données invalide");
        }

        if (!"1.0".equals(request.getMetadata().getVersion())) {
            throw new BadRequestException("Version du fichier non supportée");
        }

        try {
            // 1. Supprimer toutes les données existantes (dans l'ordre pour respecter les
            // contraintes)
            historyRepository.deleteAll();
            releaseHistoryRepository.deleteAll();
            featureFlippingRepository.deleteAll();
            actionRepository.deleteAll();
            featureRepository.deleteAll();
            squadRepository.deleteAll();
            releaseRepository.deleteAll();
            eventRepository.deleteAll();
            settingsRepository.deleteAll();
            userRepository.deleteAll();

            log.info("All existing data deleted");

            // 2. Importer les nouvelles données (dans l'ordre pour respecter les
            // contraintes)

            // Users
            if (request.getData().getUsers() != null && !request.getData().getUsers().isEmpty()) {
                userRepository.saveAll(request.getData().getUsers());
                log.info("Imported {} users", request.getData().getUsers().size());
            }

            // Settings
            if (request.getData().getSettings() != null && !request.getData().getSettings().isEmpty()) {
                settingsRepository.saveAll(request.getData().getSettings());
                log.info("Imported {} settings", request.getData().getSettings().size());
            }

            // Events
            if (request.getData().getEvents() != null && !request.getData().getEvents().isEmpty()) {
                eventRepository.saveAll(request.getData().getEvents());
                log.info("Imported {} events", request.getData().getEvents().size());
            }

            // Releases with nested relations
            if (request.getData().getReleases() != null && !request.getData().getReleases().isEmpty()) {
                for (Release release : request.getData().getReleases()) {
                    // Set bidirectional relationship for squads
                    if (release.getSquads() != null) {
                        release.getSquads().forEach(squad -> {
                            squad.setRelease(release);

                            // Set bidirectional relationship for features
                            if (squad.getFeatures() != null) {
                                squad.getFeatures().forEach(feature -> feature.setSquad(squad));
                            }

                            // Set bidirectional relationship for actions
                            if (squad.getActions() != null) {
                                squad.getActions().forEach(action -> {
                                    action.setSquad(squad);

                                    // Set bidirectional relationship for flipping
                                    if (action.getFlipping() != null) {
                                        action.getFlipping().setAction(action);
                                    }
                                });
                            }
                        });
                    }
                }
                releaseRepository.saveAll(request.getData().getReleases());
                log.info("Imported {} releases", request.getData().getReleases().size());
            }

            // History
            if (request.getData().getHistory() != null && !request.getData().getHistory().isEmpty()) {
                historyRepository.saveAll(request.getData().getHistory());
                log.info("Imported {} history entries", request.getData().getHistory().size());
            }

            // Release History
            if (request.getData().getReleaseHistory() != null && !request.getData().getReleaseHistory().isEmpty()) {
                releaseHistoryRepository.saveAll(request.getData().getReleaseHistory());
                log.info("Imported {} release history entries", request.getData().getReleaseHistory().size());
            }

            return new ImportDatabaseResponse(
                    "Base de données importée avec succès",
                    request.getMetadata().getTotalRecords());

        } catch (Exception e) {
            log.error("Error importing database", e);
            throw new RuntimeException("Erreur lors de l'import de la base de données: " + e.getMessage());
        }
    }

    /**
     * Créer un utilisateur admin si il n'existe pas déjà
     * Email: admin
     */
    @Transactional
    public void createAdminUser() {
        // Vérifier si l'utilisateur admin existe déjà
        if (userRepository.existsByEmail("admin")) {
            log.info("L'utilisateur admin existe déjà");
            return;
        }

        // Créer l'utilisateur admin avec un mot de passe conforme aux règles
        // (minimum 8 caractères, alphanumérique, avec lettres et chiffres)
        User adminUser = new User();
        adminUser.setId("cadmin001");
        adminUser.setEmail("admin");
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setFirstName("Admin");
        adminUser.setLastName("Système");
        adminUser.setThemePreference("light");
        adminUser.setWidgetOrder("[]");

        userRepository.save(adminUser);
        log.info("Utilisateur admin créé avec succès (email: admin, password: admin123)");
    }
}
