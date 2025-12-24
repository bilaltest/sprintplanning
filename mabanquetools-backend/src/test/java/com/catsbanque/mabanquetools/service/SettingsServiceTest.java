package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.SettingsDto;
import com.catsbanque.mabanquetools.entity.Settings;
import com.catsbanque.mabanquetools.repository.SettingsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SettingsServiceTest {

    @Mock
    private SettingsRepository settingsRepository;

    @InjectMocks
    private SettingsService settingsService;

    private Settings testSettings;

    @BeforeEach
    void setUp() {
        testSettings = new Settings();
        testSettings.setId("settings123");
        testSettings.setTheme("light");
        testSettings.setCustomCategories("[]");
    }

    @Test
    void getSettings_WhenExists_ShouldReturnSettings() {
        // Given
        when(settingsRepository.findAll()).thenReturn(List.of(testSettings));

        // When
        SettingsDto result = settingsService.getSettings();

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTheme()).isEqualTo("light");
        assertThat(result.getCustomCategories()).isEqualTo("[]");
    }

    @Test
    void getSettings_WhenNotExists_ShouldCreateDefault() {
        // Given
        when(settingsRepository.findAll()).thenReturn(Collections.emptyList());

        Settings defaultSettings = new Settings();
        defaultSettings.setId("settings123");
        defaultSettings.setTheme("light");
        defaultSettings.setCustomCategories("[]");

        when(settingsRepository.save(any(Settings.class))).thenReturn(defaultSettings);

        // When
        SettingsDto result = settingsService.getSettings();

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTheme()).isEqualTo("light");
        assertThat(result.getCustomCategories()).isEqualTo("[]");

        ArgumentCaptor<Settings> settingsCaptor = ArgumentCaptor.forClass(Settings.class);
        verify(settingsRepository).save(settingsCaptor.capture());

        Settings savedSettings = settingsCaptor.getValue();
        assertThat(savedSettings.getTheme()).isEqualTo("light");
        assertThat(savedSettings.getCustomCategories()).isEqualTo("[]");
    }

    @Test
    void updateSettings_WhenExists_ShouldUpdate() {
        // Given
        when(settingsRepository.findAll()).thenReturn(List.of(testSettings));

        Settings updatedSettings = new Settings();
        updatedSettings.setId("settings123");
        updatedSettings.setTheme("dark");
        updatedSettings.setCustomCategories("[\"custom1\",\"custom2\"]");

        when(settingsRepository.save(any(Settings.class))).thenReturn(updatedSettings);

        // When
        SettingsDto result = settingsService.updateSettings("dark", "[\"custom1\",\"custom2\"]", "[]");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTheme()).isEqualTo("dark");
        assertThat(result.getCustomCategories()).isEqualTo("[\"custom1\",\"custom2\"]");
        verify(settingsRepository).save(any(Settings.class));
    }

    @Test
    void updateSettings_WhenNotExists_ShouldCreateAndUpdate() {
        // Given
        when(settingsRepository.findAll()).thenReturn(Collections.emptyList());

        Settings newSettings = new Settings();
        newSettings.setId("settings123");
        newSettings.setTheme("dark");
        newSettings.setCustomCategories("[\"custom1\"]");

        when(settingsRepository.save(any(Settings.class))).thenReturn(newSettings);

        // When
        SettingsDto result = settingsService.updateSettings("dark", "[\"custom1\"]", "[]");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTheme()).isEqualTo("dark");
        assertThat(result.getCustomCategories()).isEqualTo("[\"custom1\"]");

        ArgumentCaptor<Settings> settingsCaptor = ArgumentCaptor.forClass(Settings.class);
        verify(settingsRepository).save(settingsCaptor.capture());

        Settings savedSettings = settingsCaptor.getValue();
        assertThat(savedSettings.getTheme()).isEqualTo("dark");
        assertThat(savedSettings.getCustomCategories()).isEqualTo("[\"custom1\"]");
    }

    @Test
    void updateSettings_WithLightTheme_ShouldSave() {
        // Given
        when(settingsRepository.findAll()).thenReturn(List.of(testSettings));
        when(settingsRepository.save(any(Settings.class))).thenReturn(testSettings);

        // When
        SettingsDto result = settingsService.updateSettings("light", "[]", "[]");

        // Then
        assertThat(result).isNotNull();
        verify(settingsRepository).save(any(Settings.class));
    }

    @Test
    void updateSettings_WithCustomCategories_ShouldSave() {
        // Given
        when(settingsRepository.findAll()).thenReturn(List.of(testSettings));

        Settings updated = new Settings();
        updated.setId("settings123");
        updated.setTheme("light");
        updated.setCustomCategories("[\"cat1\",\"cat2\",\"cat3\"]");

        when(settingsRepository.save(any(Settings.class))).thenReturn(updated);

        // When
        SettingsDto result = settingsService.updateSettings("light", "[\"cat1\",\"cat2\",\"cat3\"]", "[]");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getCustomCategories()).isEqualTo("[\"cat1\",\"cat2\",\"cat3\"]");
    }
}
