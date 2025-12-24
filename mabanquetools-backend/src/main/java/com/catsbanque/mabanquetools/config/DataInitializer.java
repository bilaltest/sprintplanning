package com.catsbanque.mabanquetools.config;

import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    @Transactional
    public void run(String... args) {
        cleanUpObsoletePermissions();
        createDefaultAdminUser();
        initDefaultSquads();
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

    private void createDefaultAdminUser() {
        String adminEmail = "bilal.djebbari@ca-ts.fr";

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
        admin.setFirstName("Admin");
        admin.setLastName("Système");
        admin.setThemePreference("light");
        admin.setWidgetOrder("[]");
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
        if (!permissionService.hasWriteAccess(admin.getId(),
                com.catsbanque.mabanquetools.entity.PermissionModule.ADMIN)) {
            try {
                permissionService.createAdminPermissions(admin);
                log.info("✅ Permissions admin appliquées pour {}", admin.getId());
            } catch (Exception e) {
                log.warn("Erreur lors de l'application des permissions admin: {}", e.getMessage());
            }
        }
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
}
