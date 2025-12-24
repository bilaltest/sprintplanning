package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.entity.PermissionLevel;
import com.catsbanque.mabanquetools.entity.PermissionModule;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.entity.UserPermission;
import com.catsbanque.mabanquetools.repository.UserPermissionRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PermissionServiceTest {

    @Mock
    private UserPermissionRepository permissionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PermissionService permissionService;

    private User testUser;
    private UserPermission calendarPermission;
    private UserPermission releasesPermission;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("user123");
        testUser.setEmail("test@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");

        calendarPermission = new UserPermission();
        calendarPermission.setId("perm1");
        calendarPermission.setUser(testUser);
        calendarPermission.setModule(PermissionModule.CALENDAR);
        calendarPermission.setPermissionLevel(PermissionLevel.WRITE);

        releasesPermission = new UserPermission();
        releasesPermission.setId("perm2");
        releasesPermission.setUser(testUser);
        releasesPermission.setModule(PermissionModule.RELEASES);
        releasesPermission.setPermissionLevel(PermissionLevel.READ);
    }

    @Test
    void getUserPermissions_ShouldReturnPermissionsMap() {
        // Given
        List<UserPermission> permissions = Arrays.asList(calendarPermission, releasesPermission);
        when(permissionRepository.findByUserId("user123")).thenReturn(permissions);

        // When
        Map<PermissionModule, PermissionLevel> result = permissionService.getUserPermissions("user123");

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(PermissionModule.CALENDAR)).isEqualTo(PermissionLevel.WRITE);
        assertThat(result.get(PermissionModule.RELEASES)).isEqualTo(PermissionLevel.READ);
    }

    @Test
    void getUserPermissions_WhenEmpty_ShouldReturnDefaultPermissions() {
        // Given
        when(permissionRepository.findByUserId("user123")).thenReturn(Collections.emptyList());

        // When
        Map<PermissionModule, PermissionLevel> result = permissionService.getUserPermissions("user123");

        // Then
        assertThat(result).hasSize(5);
        assertThat(result.get(PermissionModule.CALENDAR)).isEqualTo(PermissionLevel.READ);
        assertThat(result.get(PermissionModule.RELEASES)).isEqualTo(PermissionLevel.WRITE);
        assertThat(result.get(PermissionModule.ABSENCE)).isEqualTo(PermissionLevel.WRITE);
        assertThat(result.get(PermissionModule.PLAYGROUND)).isEqualTo(PermissionLevel.NONE);
        assertThat(result.get(PermissionModule.ADMIN)).isEqualTo(PermissionLevel.NONE);
    }

    @Test
    void hasReadAccess_WithReadLevel_ShouldReturnTrue() {
        // Given
        when(permissionRepository.findByUserIdAndModule("user123", PermissionModule.RELEASES))
                .thenReturn(Optional.of(releasesPermission));

        // When
        boolean hasAccess = permissionService.hasReadAccess("user123", PermissionModule.RELEASES);

        // Then
        assertThat(hasAccess).isTrue();
    }

    @Test
    void hasReadAccess_WithWriteLevel_ShouldReturnTrue() {
        // Given
        when(permissionRepository.findByUserIdAndModule("user123", PermissionModule.CALENDAR))
                .thenReturn(Optional.of(calendarPermission));

        // When
        boolean hasAccess = permissionService.hasReadAccess("user123", PermissionModule.CALENDAR);

        // Then
        assertThat(hasAccess).isTrue();
    }

    @Test
    void hasReadAccess_WithNoneLevel_ShouldReturnFalse() {
        // Given
        UserPermission nonePermission = new UserPermission();
        nonePermission.setPermissionLevel(PermissionLevel.NONE);
        when(permissionRepository.findByUserIdAndModule("user123", PermissionModule.ADMIN))
                .thenReturn(Optional.of(nonePermission));

        // When
        boolean hasAccess = permissionService.hasReadAccess("user123", PermissionModule.ADMIN);

        // Then
        assertThat(hasAccess).isFalse();
    }

    @Test
    void hasWriteAccess_WithWriteLevel_ShouldReturnTrue() {
        // Given
        when(permissionRepository.findByUserIdAndModule("user123", PermissionModule.CALENDAR))
                .thenReturn(Optional.of(calendarPermission));

        // When
        boolean hasAccess = permissionService.hasWriteAccess("user123", PermissionModule.CALENDAR);

        // Then
        assertThat(hasAccess).isTrue();
    }

    @Test
    void hasWriteAccess_WithReadLevel_ShouldReturnFalse() {
        // Given
        when(permissionRepository.findByUserIdAndModule("user123", PermissionModule.RELEASES))
                .thenReturn(Optional.of(releasesPermission));

        // When
        boolean hasAccess = permissionService.hasWriteAccess("user123", PermissionModule.RELEASES);

        // Then
        assertThat(hasAccess).isFalse();
    }

    @Test
    void getPermissionLevel_WhenFound_ShouldReturnLevel() {
        // Given
        when(permissionRepository.findByUserIdAndModule("user123", PermissionModule.CALENDAR))
                .thenReturn(Optional.of(calendarPermission));

        // When
        PermissionLevel level = permissionService.getPermissionLevel("user123", PermissionModule.CALENDAR);

        // Then
        assertThat(level).isEqualTo(PermissionLevel.WRITE);
    }

    @Test
    void getPermissionLevel_WhenNotFound_ShouldReturnNone() {
        // Given
        when(permissionRepository.findByUserIdAndModule("user123", PermissionModule.ADMIN))
                .thenReturn(Optional.empty());

        // When
        PermissionLevel level = permissionService.getPermissionLevel("user123", PermissionModule.ADMIN);

        // Then
        assertThat(level).isEqualTo(PermissionLevel.NONE);
    }

    @Test
    void createDefaultPermissions_ShouldCreateAllModules() {
        // When
        permissionService.createDefaultPermissions(testUser);

        // Then
        ArgumentCaptor<UserPermission> permissionCaptor = ArgumentCaptor.forClass(UserPermission.class);
        verify(permissionRepository, times(5)).save(permissionCaptor.capture());

        List<UserPermission> savedPermissions = permissionCaptor.getAllValues();
        assertThat(savedPermissions).hasSize(5);

        // Vérification des permissions spécifiques
        Map<PermissionModule, PermissionLevel> permissionsMap = new HashMap<>();
        savedPermissions.forEach(p -> permissionsMap.put(p.getModule(), p.getPermissionLevel()));

        assertThat(permissionsMap)
                .containsEntry(PermissionModule.CALENDAR, PermissionLevel.READ)
                .containsEntry(PermissionModule.RELEASES, PermissionLevel.WRITE)
                .containsEntry(PermissionModule.ABSENCE, PermissionLevel.WRITE)
                .containsEntry(PermissionModule.PLAYGROUND, PermissionLevel.NONE)
                .containsEntry(PermissionModule.ADMIN, PermissionLevel.NONE);
    }

    @Test
    void updateUserPermissions_WhenPermissionExists_ShouldUpdate() {
        // Given
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(permissionRepository.findByUserIdAndModule("user123", PermissionModule.CALENDAR))
                .thenReturn(Optional.of(calendarPermission));

        Map<PermissionModule, PermissionLevel> newPermissions = new HashMap<>();
        newPermissions.put(PermissionModule.CALENDAR, PermissionLevel.READ);

        // When
        permissionService.updateUserPermissions("user123", newPermissions);

        // Then
        verify(permissionRepository).save(any(UserPermission.class));
        assertThat(calendarPermission.getPermissionLevel()).isEqualTo(PermissionLevel.READ);
    }

    @Test
    void updateUserPermissions_WhenPermissionDoesNotExist_ShouldCreate() {
        // Given
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(permissionRepository.findByUserIdAndModule("user123", PermissionModule.ADMIN))
                .thenReturn(Optional.empty());

        Map<PermissionModule, PermissionLevel> newPermissions = new HashMap<>();
        newPermissions.put(PermissionModule.ADMIN, PermissionLevel.WRITE);

        // When
        permissionService.updateUserPermissions("user123", newPermissions);

        // Then
        ArgumentCaptor<UserPermission> permissionCaptor = ArgumentCaptor.forClass(UserPermission.class);
        verify(permissionRepository).save(permissionCaptor.capture());

        UserPermission savedPermission = permissionCaptor.getValue();
        assertThat(savedPermission.getModule()).isEqualTo(PermissionModule.ADMIN);
        assertThat(savedPermission.getPermissionLevel()).isEqualTo(PermissionLevel.WRITE);
        assertThat(savedPermission.getUserId()).isEqualTo(testUser.getId());
    }

    @Test
    void updateUserPermissions_WhenUserNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        Map<PermissionModule, PermissionLevel> newPermissions = new HashMap<>();
        newPermissions.put(PermissionModule.CALENDAR, PermissionLevel.READ);

        // When & Then
        assertThatThrownBy(() -> permissionService.updateUserPermissions("user123", newPermissions))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Utilisateur non trouvé");
    }
}
