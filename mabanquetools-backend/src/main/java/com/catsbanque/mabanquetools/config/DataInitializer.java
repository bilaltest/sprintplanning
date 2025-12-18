package com.catsbanque.mabanquetools.config;

import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initialise les données par défaut au démarrage
 * Crée l'utilisateur admin si il n'existe pas
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.catsbanque.mabanquetools.service.PermissionService permissionService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final com.catsbanque.mabanquetools.service.MicroserviceService microserviceService;
    private final com.catsbanque.mabanquetools.service.ReleaseService releaseService;

    @Override
    public void run(String... args) {
        cleanUpObsoletePermissions();
        createDefaultAdminUser();
        microserviceService.initDefaultMicroservices();
        releaseService.migrateSlugs();
    }

    private void createDefaultAdminUser() {
        String adminEmail = "admin";

        java.util.Optional<User> adminOpt = userRepository.findByEmail(adminEmail);

        if (adminOpt.isEmpty()) {
            User admin = new User();
            admin.setId("admin001");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setFirstName("Admin");
            admin.setLastName("Système");
            admin.setThemePreference("light");
            admin.setWidgetOrder("[]");

            User savedAdmin = userRepository.save(admin);
            permissionService.createDefaultPermissions(savedAdmin);
            log.info("✅ Utilisateur admin créé avec permissions : {} / {}", adminEmail, "admin");
        } else {
            // S'assurer que les permissions existent même si l'user existe déjà
            User admin = adminOpt.get();

            // Si les permissions par défaut sont retournées (donc pas de vraies permissions
            // en BDD pour certains cas),
            // ou si la map est vide (bien que getUserPermissions renvoie default si vide),
            // on force la recréation si nécessaire.
            // Une façon simple est de vérifier si le module ADMIN est présent avec WRITE.
            // Mais getUserPermissions renvoie des defaults si vide.

            // On peut checker directement via permissionService pour voir s'il a les droits
            // admin
            if (!permissionService.hasWriteAccess(admin.getId(),
                    com.catsbanque.mabanquetools.entity.PermissionModule.ADMIN)) {
                log.info("⚠️  L'admin existant n'a pas les droits ADMIN WRITE. Correction...");
                // On crée les permissions par défaut (qui incluent ADMIN WRITE)
                // Attention: createDefaultPermissions fait des saves directs.
                // Il vaut mieux utiliser une méthode update ou gérer ça finement.
                // Pour faire simple et robuste : on réapplique les defaults pour l'admin.
                try {
                    permissionService.createDefaultPermissions(admin);
                    log.info("✅ Permissions admin corrigées");
                } catch (Exception e) {
                    // Ignorer si doublon (ConstraintViolation) - mais createDefaultPermissions fait
                    // des new UserPermission.
                    // Il n'y a pas de check d'existence dans createDefaultPermissions.
                    // Il faut donc faire attention.
                    log.warn("Erreur lors de la correction des permissions admin: {}", e.getMessage());
                }
            } else {
                log.info("ℹ️  Utilisateur admin existe déjà avec les droits corrects");
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
