package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.AdminStats;
import com.catsbanque.mabanquetools.dto.AdminStatsResponse;
import com.catsbanque.mabanquetools.dto.AdminUpdateUserRequest;
import com.catsbanque.mabanquetools.dto.AdminUserDto;
import com.catsbanque.mabanquetools.dto.AdminUsersResponse;
import com.catsbanque.mabanquetools.dto.DatabaseExportDto;
import com.catsbanque.mabanquetools.dto.DatabaseImportRequest;
import com.catsbanque.mabanquetools.dto.DeletedUserInfo;
import com.catsbanque.mabanquetools.dto.DeletedUserResponse;
import com.catsbanque.mabanquetools.dto.ExportData;
import com.catsbanque.mabanquetools.dto.ExportMetadata;
import com.catsbanque.mabanquetools.dto.ImportDatabaseResponse;
import com.catsbanque.mabanquetools.dto.TotalRecords;
import com.catsbanque.mabanquetools.entity.Absence;
import com.catsbanque.mabanquetools.entity.ClosedDay;
import com.catsbanque.mabanquetools.entity.Event;
import com.catsbanque.mabanquetools.entity.Game;
import com.catsbanque.mabanquetools.entity.GameScore;
import com.catsbanque.mabanquetools.entity.History;
import com.catsbanque.mabanquetools.entity.Microservice;
import com.catsbanque.mabanquetools.entity.PermissionLevel;
import com.catsbanque.mabanquetools.entity.PermissionModule;
import com.catsbanque.mabanquetools.entity.Release;
import com.catsbanque.mabanquetools.entity.ReleaseHistory;
import com.catsbanque.mabanquetools.entity.ReleaseNoteEntry;
import com.catsbanque.mabanquetools.entity.Settings;
import com.catsbanque.mabanquetools.entity.Sprint;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.entity.UserPermission;
import com.catsbanque.mabanquetools.exception.BadRequestException;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.AbsenceRepository;
import com.catsbanque.mabanquetools.repository.ClosedDayRepository;
import com.catsbanque.mabanquetools.repository.ActionRepository;
import com.catsbanque.mabanquetools.repository.EventRepository;
import com.catsbanque.mabanquetools.repository.FeatureFlippingRepository;
import com.catsbanque.mabanquetools.repository.FeatureRepository;
import com.catsbanque.mabanquetools.repository.GameRepository;
import com.catsbanque.mabanquetools.repository.GameScoreRepository;
import com.catsbanque.mabanquetools.repository.HistoryRepository;
import com.catsbanque.mabanquetools.repository.MicroserviceRepository;
import com.catsbanque.mabanquetools.repository.ReleaseHistoryRepository;
import com.catsbanque.mabanquetools.repository.ReleaseNoteEntryRepository;
import com.catsbanque.mabanquetools.repository.ReleaseRepository;
import com.catsbanque.mabanquetools.repository.SettingsRepository;
import com.catsbanque.mabanquetools.repository.SprintRepository;
import com.catsbanque.mabanquetools.repository.SquadRepository;
import com.catsbanque.mabanquetools.repository.UserPermissionRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
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
    private final AbsenceRepository absenceRepository;
    private final ClosedDayRepository closedDayRepository;
    private final SprintRepository sprintRepository;
    private final MicroserviceRepository microserviceRepository;
    private final GameRepository gameRepository;
    private final GameScoreRepository gameScoreRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final ReleaseNoteEntryRepository releaseNoteEntryRepository;
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
                            .metier(user.getMetier())
                            .tribu(user.getTribu())
                            .interne(user.isInterne())
                            .squads(user.getSquads())
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
     * Mettre à jour un utilisateur
     */
    @Transactional
    public AdminUserDto updateUser(String id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (request.getFirstName() != null)
            user.setFirstName(request.getFirstName());
        if (request.getLastName() != null)
            user.setLastName(request.getLastName());
        if (request.getMetier() != null)
            user.setMetier(request.getMetier());
        if (request.getTribu() != null)
            user.setTribu(request.getTribu());
        if (request.getInterne() != null)
            user.setInterne(request.getInterne());
        if (request.getSquads() != null)
            user.setSquads(request.getSquads());

        User savedUser = userRepository.save(user);
        log.debug("Updated user: {}", savedUser);

        // Map permission
        Map<PermissionModule, PermissionLevel> permissions = permissionService.getUserPermissions(savedUser.getId());
        long historyCount = historyRepository.findByUserIdOrderByTimestampDesc(savedUser.getId()).size();

        return AdminUserDto.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .themePreference(savedUser.getThemePreference())
                .metier(savedUser.getMetier())
                .tribu(savedUser.getTribu())
                .interne(savedUser.isInterne())
                .squads(savedUser.getSquads())
                .createdAt(savedUser.getCreatedAt())
                .updatedAt(savedUser.getUpdatedAt())
                .historiesCount(historyCount)
                .permissions(permissions)
                .build();
    }

    /**
     * Réinitialiser le mot de passe d'un utilisateur
     */
    @Transactional
    public void resetUserPassword(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // Mot de passe par défaut : "password"
        user.setPassword(passwordEncoder.encode("password"));
        userRepository.save(user);
        log.info("Mot de passe réinitialisé pour l'utilisateur {}", id);
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
        log.debug("Starting database export...");
        List<User> users = userRepository.findAll();
        List<Event> events = eventRepository.findAll();
        List<Release> releases = releaseRepository.findAll();

        // Initialize lazy collections for Release export
        for (Release release : releases) {
            Hibernate.initialize(release.getSquads());
            for (com.catsbanque.mabanquetools.entity.Squad squad : release.getSquads()) {
                Hibernate.initialize(squad.getFeatures());
                Hibernate.initialize(squad.getActions());
                for (com.catsbanque.mabanquetools.entity.Action action : squad.getActions()) {
                    Hibernate.initialize(action.getFlipping());
                }
            }
        }

        List<History> history = historyRepository.findAll();
        List<ReleaseHistory> releaseHistory = releaseHistoryRepository.findAll();
        List<Settings> settings = settingsRepository.findAll();
        List<Absence> absences = absenceRepository.findAll();
        List<Sprint> sprints = sprintRepository.findAll();
        List<Microservice> microservices = microserviceRepository.findAll();
        List<Game> games = gameRepository.findAll();
        List<GameScore> gameScores = gameScoreRepository.findAll();
        List<UserPermission> userPermissions = userPermissionRepository.findAll();
        List<ReleaseNoteEntry> releaseNoteEntries = releaseNoteEntryRepository.findAll();
        List<ClosedDay> closedDays = closedDayRepository.findAll();

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
        totalRecords.setAbsences(absences.size());
        totalRecords.setSprints(sprints.size());
        totalRecords.setMicroservices(microservices.size());
        totalRecords.setGames(games.size());
        totalRecords.setGameScores(gameScores.size());
        totalRecords.setUserPermissions(userPermissions.size());
        totalRecords.setReleaseNoteEntries(releaseNoteEntries.size());
        totalRecords.setClosedDays(closedDays.size());
        metadata.setTotalRecords(totalRecords);

        // Créer les données d'export
        ExportData exportData = new ExportData();
        exportData.setUsers(users);
        exportData.setEvents(events);
        exportData.setReleases(releases);
        exportData.setHistory(history);
        exportData.setReleaseHistory(releaseHistory);
        exportData.setSettings(settings);
        exportData.setAbsences(absences);
        exportData.setSprints(sprints);
        exportData.setMicroservices(microservices);
        exportData.setGames(games);
        exportData.setGameScores(gameScores);
        exportData.setUserPermissions(userPermissions);
        exportData.setReleaseNoteEntries(releaseNoteEntries);
        exportData.setClosedDays(closedDays);

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
        log.debug("Starting database import...");
        if (request.getData() == null || request.getMetadata() == null) {
            throw new BadRequestException("Format de données invalide");
        }

        if (!"1.0".equals(request.getMetadata().getVersion())) {
            throw new BadRequestException("Version du fichier non supportée");
        }

        try {
            // 1. Supprimer toutes les données existantes (dans l'ordre pour respecter les
            // contraintes)
            releaseNoteEntryRepository.deleteAll();
            gameScoreRepository.deleteAll();
            userPermissionRepository.deleteAll();
            absenceRepository.deleteAll();
            closedDayRepository.deleteAll();
            sprintRepository.deleteAll();
            historyRepository.deleteAll();
            releaseHistoryRepository.deleteAll();
            featureFlippingRepository.deleteAll();
            actionRepository.deleteAll();
            featureRepository.deleteAll();
            squadRepository.deleteAll();
            releaseRepository.deleteAll();
            eventRepository.deleteAll();
            microserviceRepository.deleteAll();
            gameRepository.deleteAll();
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

            // Microservices
            if (request.getData().getMicroservices() != null && !request.getData().getMicroservices().isEmpty()) {
                microserviceRepository.saveAll(request.getData().getMicroservices());
                log.info("Imported {} microservices", request.getData().getMicroservices().size());
            }

            // Sprints
            if (request.getData().getSprints() != null && !request.getData().getSprints().isEmpty()) {
                sprintRepository.saveAll(request.getData().getSprints());
                log.info("Imported {} sprints", request.getData().getSprints().size());
            }

            // Absences
            if (request.getData().getAbsences() != null && !request.getData().getAbsences().isEmpty()) {
                absenceRepository.saveAll(request.getData().getAbsences());
                log.info("Imported {} absences", request.getData().getAbsences().size());
            }

            // Games
            if (request.getData().getGames() != null && !request.getData().getGames().isEmpty()) {
                gameRepository.saveAll(request.getData().getGames());
                log.info("Imported {} games", request.getData().getGames().size());
            }

            // Game Scores
            if (request.getData().getGameScores() != null && !request.getData().getGameScores().isEmpty()) {
                gameScoreRepository.saveAll(request.getData().getGameScores());
                log.info("Imported {} game scores", request.getData().getGameScores().size());
            }

            // User Permissions
            if (request.getData().getUserPermissions() != null && !request.getData().getUserPermissions().isEmpty()) {
                userPermissionRepository.saveAll(request.getData().getUserPermissions());
                log.info("Imported {} user permissions", request.getData().getUserPermissions().size());
            }

            // Release Note Entries
            if (request.getData().getReleaseNoteEntries() != null
                    && !request.getData().getReleaseNoteEntries().isEmpty()) {
                releaseNoteEntryRepository.saveAll(request.getData().getReleaseNoteEntries());
                log.info("Imported {} release note entries", request.getData().getReleaseNoteEntries().size());
            }

            // Closed Days
            if (request.getData().getClosedDays() != null && !request.getData().getClosedDays().isEmpty()) {
                closedDayRepository.saveAll(request.getData().getClosedDays());
                log.info("Imported {} closed days", request.getData().getClosedDays().size());
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
