package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.Settings;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class SettingsRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SettingsRepository settingsRepository;

    @Test
    void shouldSaveSettings() {
        // Given
        Settings settings = new Settings();
        settings.setId("settings-1");
        settings.setTheme("dark");
        settings.setCustomCategories("[{\"name\":\"Custom MEP\",\"color\":\"#ff0000\"}]");

        // When
        Settings saved = settingsRepository.save(settings);

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTheme()).isEqualTo("dark");
        assertThat(saved.getCustomCategories()).contains("Custom MEP");
    }

    @Test
    void shouldFindAllSettings() {
        // Given
        Settings settings1 = new Settings();
        settings1.setId("settings-1");
        settings1.setTheme("light");
        settings1.setCustomCategories("[]");

        entityManager.persist(settings1);
        entityManager.flush();

        // When
        List<Settings> all = settingsRepository.findAll();

        // Then
        assertThat(all).hasSize(1);
        assertThat(all.get(0).getTheme()).isEqualTo("light");
    }

    @Test
    void shouldUpdateSettings() {
        // Given
        Settings settings = new Settings();
        settings.setId("settings-1");
        settings.setTheme("light");
        settings.setCustomCategories("[]");
        Settings saved = entityManager.persist(settings);
        entityManager.flush();

        // When
        saved.setTheme("dark");
        saved.setCustomCategories("[{\"name\":\"New Category\"}]");
        Settings updated = settingsRepository.save(saved);

        // Then
        assertThat(updated.getTheme()).isEqualTo("dark");
        assertThat(updated.getCustomCategories()).contains("New Category");
    }

    @Test
    void shouldDeleteSettings() {
        // Given
        Settings settings = new Settings();
        settings.setId("settings-1");
        settings.setTheme("light");
        settings.setCustomCategories("[]");
        Settings saved = entityManager.persist(settings);
        entityManager.flush();

        // When
        settingsRepository.deleteById(saved.getId());

        // Then
        Optional<Settings> found = settingsRepository.findById(saved.getId());
        assertThat(found).isEmpty();
    }
}
