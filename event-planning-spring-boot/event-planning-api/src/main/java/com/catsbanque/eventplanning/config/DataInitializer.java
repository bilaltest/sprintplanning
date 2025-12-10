package com.catsbanque.eventplanning.config;

import com.catsbanque.eventplanning.entity.User;
import com.catsbanque.eventplanning.repository.UserRepository;
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

    @Override
    public void run(String... args) {
        createDefaultAdminUser();
    }

    private void createDefaultAdminUser() {
        String adminEmail = "admin";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setId("admin001");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setFirstName("Admin");
            admin.setLastName("Système");
            admin.setThemePreference("light");
            admin.setWidgetOrder("[]");

            userRepository.save(admin);
            log.info("✅ Utilisateur admin créé : {} / {}", adminEmail, "admin");
        } else {
            log.info("ℹ️  Utilisateur admin existe déjà");
        }
    }
}
