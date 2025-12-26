package com.catsbanque.mabanquetools.config;

import com.catsbanque.mabanquetools.entity.Absence;
import com.catsbanque.mabanquetools.entity.AbsenceType;
import com.catsbanque.mabanquetools.entity.Team;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.repository.UserRepository;
import com.catsbanque.mabanquetools.util.CsvAbsenceParser;
import com.catsbanque.mabanquetools.util.CsvUserParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Initialise les données par défaut au démarrage
 * Crée l'utilisateur admin si il n'existe pas
 */
@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.catsbanque.mabanquetools.service.PermissionService permissionService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final com.catsbanque.mabanquetools.service.MicroserviceService microserviceService;
    private final com.catsbanque.mabanquetools.service.ReleaseService releaseService;
    private final com.catsbanque.mabanquetools.repository.TeamRepository teamRepository;
    private final com.catsbanque.mabanquetools.repository.AbsenceRepository absenceRepository;

    @Override
    @Transactional
    public void run(String... args) {
        cleanUpObsoletePermissions();
        createDefaultAdminUser();
        createGuestUser();
        initDefaultSquads();
        createDefaultUsers(); // ✅ Nouvelle méthode - charge utilisateurs depuis CSV
        createDefaultAbsences(); // ✅ Nouvelle méthode - charge absences depuis CSV
        microserviceService.initDefaultMicroservices();
        releaseService.migrateSlugs();
    }

    private void initDefaultSquads() {
        if (teamRepository.count() == 0) {
            log.info("Populating default squads...");
            java.util.List<String> defaultSquads = java.util.Arrays.asList(
                    "Squad 1", "Squad 2", "Squad 3", "Squad 4",
                    "Squad 5", "Squad 6", "ADAM", "Transverse");

            for (String squadName : defaultSquads) {
                com.catsbanque.mabanquetools.entity.Team team = new com.catsbanque.mabanquetools.entity.Team();
                team.setName(squadName);
                team.setDescription("Equipe par défaut " + squadName);
                teamRepository.save(team);
            }
            log.info("✅ {} squads created.", defaultSquads.size());
        }
    }

    /**
     * Initialise les utilisateurs depuis le fichier CSV
     * Charge le fichier data/default-users.csv et crée chaque utilisateur
     * avec ses teams et permissions par défaut.
     *
     * Idempotent: vérifie si les utilisateurs existent déjà (par email)
     */
    private void createDefaultUsers() {
        // Vérifier si déjà initialisé (skip si plus d'un utilisateur)
        long userCount = userRepository.count();
        if (userCount > 2) {
            log.info("✓ Users already initialized ({} users)", userCount);
            return;
        }

        // Charger les données depuis le CSV
        String csvPath = "data/default-users.csv";
        log.info("Loading users from CSV: {}", csvPath);

        List<CsvUserParser.UserCsvRow> csvUsers = CsvUserParser.parseUsersFromCsv(csvPath);

        if (csvUsers.isEmpty()) {
            log.warn("⚠️  No users found in CSV file: {}", csvPath);
            return;
        }

        log.info("Initializing {} users from CSV...", csvUsers.size());

        int created = 0;
        int skipped = 0;

        for (CsvUserParser.UserCsvRow csvUser : csvUsers) {
            try {
                // Vérifier si existe déjà (idempotence)
                if (userRepository.findByEmail(csvUser.getEmail()).isPresent()) {
                    skipped++;
                    continue;
                }

                // Créer l'utilisateur
                User user = new User();
                user.setEmail(csvUser.getEmail());
                user.setPassword(passwordEncoder.encode("password"));
                user.setFirstName(csvUser.getFirstName());
                user.setLastName(csvUser.getLastName());
                user.setMetier(csvUser.getMetier());
                user.setTribu(csvUser.getTribu());
                user.setInterne(csvUser.isInterne());
                user.setThemePreference("light");
                user.setWidgetOrder("[]");

                // Assigner les teams (par nom)
                Set<Team> teams = new HashSet<>();
                for (String teamName : csvUser.getTeamNames()) {
                    Team team = teamRepository.findByName(teamName)
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "Team not found: " + teamName + " for user " + csvUser.getEmail()));
                    teams.add(team);
                }
                user.setTeams(teams);

                // Sauvegarder (génère l'ID via @Cuid)
                User savedUser = userRepository.save(user);

                // Créer les permissions par défaut
                permissionService.createDefaultPermissions(savedUser);

                created++;
                log.info("✓ Created user: {} (teams: {})",
                        savedUser.getEmail(),
                        savedUser.getTeams().stream()
                                .map(Team::getName)
                                .collect(Collectors.joining(", ")));

            } catch (Exception e) {
                log.error("✗ Failed to create user {}: {}",
                        csvUser.getEmail(), e.getMessage());
            }
        }

        log.info("✅ User initialization complete: {} created, {} skipped",
                created, skipped);
    }

    private void createDefaultAdminUser() {
        String adminEmail = "bilal.djebbari@ca-ts.fr".toLowerCase();

        // Chercher par Email uniquement (plus fiable que ID hardcodé)
        java.util.Optional<User> adminByEmail = userRepository.findByEmail(adminEmail);

        if (adminByEmail.isPresent()) {
            User admin = adminByEmail.get();
            log.info("ℹ️  Utilisateur admin trouvé par email (ID: {}). Vérification des permissions...", admin.getId());
            ensureAdminPermissions(admin);
            return;
        }

        // Créer si inexistant (Laissez le générateur CUID gérer l'ID)
        log.info("Création du nouvel utilisateur admin (email: {})...", adminEmail);
        User admin = new User();
        // ID généré automatiquement par @Cuid
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode("password"));
        admin.setFirstName("Bilal");
        admin.setLastName("Djebbari");
        admin.setThemePreference("light");
        admin.setWidgetOrder("[]");
        admin.setMetier("Back");
        admin.setTribu("Ma Banque");
        admin.setInterne(true);

        try {
            User savedAdmin = userRepository.save(admin);
            ensureAdminPermissions(savedAdmin);
            log.info("✅ Utilisateur admin créé avec succès (ID: {})", savedAdmin.getId());
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création de l'admin: {}", e.getMessage());
            throw new RuntimeException("Impossible d'initialiser l'admin", e);
        }
    }

    private void ensureAdminPermissions(User admin) {
        // Vérifier si toutes les permissions admin sont présentes, y compris BLOG
        boolean needsUpdate = !permissionService.hasWriteAccess(admin.getId(),
                com.catsbanque.mabanquetools.entity.PermissionModule.ADMIN)
                || !permissionService.hasWriteAccess(admin.getId(),
                com.catsbanque.mabanquetools.entity.PermissionModule.BLOG);

        if (needsUpdate) {
            try {
                permissionService.createAdminPermissions(admin);
                log.info("✅ Permissions admin appliquées/mises à jour pour {} (y compris BLOG)", admin.getId());
            } catch (Exception e) {
                log.warn("Erreur lors de l'application des permissions admin: {}", e.getMessage());
            }
        } else {
            log.debug("✓ Permissions admin déjà à jour pour {}", admin.getId());
        }
    }

    /**
     * Initialise les absences depuis le fichier CSV
     * Charge le fichier data/default-absences.csv et crée chaque absence
     * en résolvant les utilisateurs par leur email.
     *
     * Idempotent: vérifie si les absences existent déjà
     */
    private void createDefaultAbsences() {
        // Vérifier si déjà initialisé (skip si au moins une absence existe)
        long absenceCount = absenceRepository.count();
        if (absenceCount > 0) {
            log.info("✓ Absences already initialized ({} absences)", absenceCount);
            return;
        }

        // Charger les données depuis le CSV
        String csvPath = "data/default-absences.csv";
        log.info("Loading absences from CSV: {}", csvPath);

        List<CsvAbsenceParser.AbsenceCsvRow> csvAbsences = CsvAbsenceParser.parseAbsencesFromCsv(csvPath);

        if (csvAbsences.isEmpty()) {
            log.warn("⚠️  No absences found in CSV file: {}", csvPath);
            return;
        }

        log.info("Initializing {} absences from CSV...", csvAbsences.size());

        int created = 0;
        int skipped = 0;

        for (CsvAbsenceParser.AbsenceCsvRow csvAbsence : csvAbsences) {
            try {
                // Trouver l'utilisateur par email
                User user = userRepository.findByEmail(csvAbsence.getEmail())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "User not found: " + csvAbsence.getEmail()));

                // Créer l'absence
                Absence absence = new Absence();
                absence.setUserId(user.getId());
                absence.setStartDate(csvAbsence.getStartDate());
                absence.setEndDate(csvAbsence.getEndDate());
                absence.setType(AbsenceType.valueOf(csvAbsence.getType()));

                // Sauvegarder (génère l'ID via @Cuid)
                absenceRepository.save(absence);

                created++;
                log.debug("✓ Created absence for: {} ({} to {})",
                        csvAbsence.getEmail(),
                        csvAbsence.getStartDate(),
                        csvAbsence.getEndDate());

            } catch (Exception e) {
                log.error("✗ Failed to create absence for {}: {}",
                        csvAbsence.getEmail(), e.getMessage());
            }
        }

        log.info("✅ Absence initialization complete: {} created, {} skipped",
                created, skipped);
    }

    private void cleanUpObsoletePermissions() {
        try {
            log.info("🧹 Nettoyage des permissions obsolètes (PI_PLANNING)...");
            int deleted = jdbcTemplate.update("DELETE FROM user_permissions WHERE module = 'PI_PLANNING'");
            if (deleted > 0) {
                log.info("✅ {} permissions obsolètes 'PI_PLANNING' supprimées.", deleted);
            } else {
                log.info("ℹ️  Aucune permission 'PI_PLANNING' trouvée.");
            }
        } catch (Exception e) {
            log.warn("⚠️ Erreur lors du nettoyage des permissions : {}", e.getMessage());
        }
    }

    private void createGuestUser() {
        String guestEmail = "invite".toLowerCase();

        if (userRepository.findByEmail(guestEmail).isPresent()) {
            log.info("ℹ️  Guest user already exists.");
            return;
        }

        log.info("Creating guest user (email: {})...", guestEmail);
        User guest = new User();
        // ID generated automatically
        guest.setEmail(guestEmail);
        guest.setPassword(passwordEncoder.encode("invite"));
        guest.setFirstName("Invité");
        guest.setLastName("Invité");
        guest.setThemePreference("light");
        guest.setWidgetOrder("[]");
        guest.setInterne(true);
        guest.setCannotChangePassword(true);
        guest.setHiddenFromAbsenceTable(true);

        try {
            User savedGuest = userRepository.save(guest);

            // Assign specific permissions: CALENDAR READ only
            permissionService.updateUserPermissions(savedGuest.getId(), java.util.Map.of(
                    com.catsbanque.mabanquetools.entity.PermissionModule.CALENDAR,
                    com.catsbanque.mabanquetools.entity.PermissionLevel.READ,
                    com.catsbanque.mabanquetools.entity.PermissionModule.ABSENCE,
                    com.catsbanque.mabanquetools.entity.PermissionLevel.NONE,
                    com.catsbanque.mabanquetools.entity.PermissionModule.RELEASES,
                    com.catsbanque.mabanquetools.entity.PermissionLevel.NONE,
                    com.catsbanque.mabanquetools.entity.PermissionModule.PLAYGROUND,
                    com.catsbanque.mabanquetools.entity.PermissionLevel.NONE,
                    com.catsbanque.mabanquetools.entity.PermissionModule.BLOG,
                    com.catsbanque.mabanquetools.entity.PermissionLevel.NONE,
                    com.catsbanque.mabanquetools.entity.PermissionModule.ADMIN,
                    com.catsbanque.mabanquetools.entity.PermissionLevel.NONE));

            log.info("✅ Guest user created with restricted permissions (ID: {})", savedGuest.getId());
        } catch (Exception e) {
            log.error("❌ Error creating guest user: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize guest user", e);
        }
    }
}
