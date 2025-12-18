package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.SettingsDto;
import com.catsbanque.mabanquetools.entity.Settings;
import com.catsbanque.mabanquetools.repository.SettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service de gestion des paramètres
 * Les settings sont mis en cache (1h) car récupérés très fréquemment et
 * changent rarement
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SettingsRepository settingsRepository;

    /**
     * Récupérer les paramètres (ou créer par défaut)
     * Mise en cache pour 1h (configuré dans CacheConfig)
     */
    @Cacheable("settings")
    @Transactional(readOnly = true)
    public SettingsDto getSettings() {
        Settings settings = settingsRepository.findAll().stream()
                .findFirst()
                .orElse(null);

        if (settings == null) {
            // Créer les paramètres par défaut
            settings = new Settings();
            settings.setTheme("light");
            settings.setCustomCategories("[]");
            settings = settingsRepository.save(settings);
            log.info("Created default settings");
        }

        return SettingsDto.fromEntity(settings);
    }

    /**
     * Mettre à jour les paramètres
     * Invalide le cache pour forcer le rechargement au prochain GET
     */
    @CacheEvict(value = "settings", allEntries = true)
    @Transactional
    public SettingsDto updateSettings(String theme, String customCategories) {
        Settings settings = settingsRepository.findAll().stream()
                .findFirst()
                .orElse(new Settings());

        settings.setTheme(theme);
        settings.setCustomCategories(customCategories);

        Settings updated = settingsRepository.save(settings);
        log.info("Settings updated");
        return SettingsDto.fromEntity(updated);
    }
}
