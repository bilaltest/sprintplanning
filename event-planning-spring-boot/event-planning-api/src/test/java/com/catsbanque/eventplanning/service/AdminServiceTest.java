package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.AdminStatsResponse;
import com.catsbanque.eventplanning.dto.AdminUsersResponse;
import com.catsbanque.eventplanning.dto.DatabaseExportDto;
import com.catsbanque.eventplanning.dto.DatabaseImportRequest;
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
import com.catsbanque.eventplanning.entity.Settings;
import com.catsbanque.eventplanning.entity.Squad;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.anyList;
import static org.mockito.Mockito.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private ReleaseRepository releaseRepository;

    @Mock
    private HistoryRepository historyRepository;

    @Mock
    private ReleaseHistoryRepository releaseHistoryRepository;

    @Mock
    private SettingsRepository settingsRepository;

    @Mock
    private SquadRepository squadRepository;

    @Mock
    private FeatureRepository featureRepository;

    @Mock
    private ActionRepository actionRepository;

    @Mock
    private FeatureFlippingRepository featureFlippingRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PermissionService permissionService;

    @InjectMocks
    private AdminService adminService;

    private User testUser;
    private Event testEvent;
    private Release testRelease;
    private History testHistory;
    private Settings testSettings;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("user123");
        testUser.setEmail("test@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setThemePreference("light");
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());

        testEvent = new Event();
        testEvent.setId("event123");
        testEvent.setTitle("Test Event");

        testRelease = new Release();
        testRelease.setId("release123");
        testRelease.setName("Test Release");

        testHistory = new History();
        testHistory.setId("history123");
        testHistory.setUserId("user123");
        testHistory.setUserDisplayName("John D.");

        testSettings = new Settings();
        testSettings.setId("settings123");
        testSettings.setTheme("light");
    }

    @Test
    void getAllUsers_ShouldReturnUsersWithPermissions() {
        // Given
        when(userRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(Collections.singletonList(testUser));
        when(historyRepository.findByUserIdOrderByTimestampDesc("user123"))
                .thenReturn(Collections.singletonList(testHistory));

        Map<PermissionModule, PermissionLevel> permissions = new HashMap<>();
        permissions.put(PermissionModule.CALENDAR, PermissionLevel.WRITE);
        when(permissionService.getUserPermissions("user123"))
                .thenReturn(permissions);

        // When
        AdminUsersResponse result = adminService.getAllUsers();

        // Then
        assertThat(result.getUsers()).hasSize(1);
        assertThat(result.getUsers().get(0).getEmail()).isEqualTo("test@example.com");
        assertThat(result.getUsers().get(0).getHistoriesCount()).isEqualTo(1);
        assertThat(result.getUsers().get(0).getPermissions()).hasSize(1);
        verify(permissionService).getUserPermissions("user123");
    }

    @Test
    void getAllUsers_WithMultipleUsers_ShouldReturnAll() {
        // Given
        User user2 = new User();
        user2.setId("user2");
        user2.setEmail("user2@example.com");
        user2.setFirstName("Jane");
        user2.setLastName("Smith");
        user2.setCreatedAt(LocalDateTime.now());
        user2.setUpdatedAt(LocalDateTime.now());

        when(userRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(Arrays.asList(testUser, user2));
        when(historyRepository.findByUserIdOrderByTimestampDesc(anyString()))
                .thenReturn(new ArrayList<>());
        when(permissionService.getUserPermissions(anyString()))
                .thenReturn(new HashMap<>());

        // When
        AdminUsersResponse result = adminService.getAllUsers();

        // Then
        assertThat(result.getUsers()).hasSize(2);
    }

    @Test
    void deleteUser_WithValidId_ShouldDeleteUserAndUpdateHistories() {
        // Given
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(historyRepository.findByUserIdOrderByTimestampDesc("user123"))
                .thenReturn(Collections.singletonList(testHistory));
        when(releaseHistoryRepository.findByUserIdOrderByTimestampDesc("user123"))
                .thenReturn(new ArrayList<>());

        // When
        DeletedUserResponse result = adminService.deleteUser("user123");

        // Then
        assertThat(result.getMessage()).isEqualTo("Utilisateur supprimé avec succès");
        assertThat(result.getDeletedUser().getEmail()).isEqualTo("test@example.com");
        verify(historyRepository).saveAll(argThat(histories -> {
            List<History> historyList = new ArrayList<>();
            histories.forEach(historyList::add);
            assertThat(historyList).hasSize(1);
            assertThat(historyList.get(0).getUserDisplayName()).isEqualTo("Deleted User");
            return true;
        }));
        verify(userRepository).delete(testUser);
    }

    @Test
    void deleteUser_WithInvalidId_ShouldThrowException() {
        // Given
        when(userRepository.findById("invalid")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> adminService.deleteUser("invalid"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Utilisateur non trouvé");
    }

    @Test
    void getStats_ShouldReturnCorrectCounts() {
        // Given
        when(userRepository.count()).thenReturn(5L);
        when(eventRepository.count()).thenReturn(10L);
        when(releaseRepository.count()).thenReturn(3L);
        when(historyRepository.count()).thenReturn(20L);

        // When
        AdminStatsResponse result = adminService.getStats();

        // Then
        assertThat(result.getStats().getTotalUsers()).isEqualTo(5L);
        assertThat(result.getStats().getTotalEvents()).isEqualTo(10L);
        assertThat(result.getStats().getTotalReleases()).isEqualTo(3L);
        assertThat(result.getStats().getTotalHistoryEntries()).isEqualTo(20L);
    }

    @Test
    void exportDatabase_ShouldExportAllData() {
        // Given
        when(userRepository.findAll()).thenReturn(Collections.singletonList(testUser));
        when(eventRepository.findAll()).thenReturn(Collections.singletonList(testEvent));
        when(releaseRepository.findAll()).thenReturn(Collections.singletonList(testRelease));
        when(historyRepository.findAll()).thenReturn(Collections.singletonList(testHistory));
        when(releaseHistoryRepository.findAll()).thenReturn(new ArrayList<>());
        when(settingsRepository.findAll()).thenReturn(Collections.singletonList(testSettings));

        // When
        DatabaseExportDto result = adminService.exportDatabase();

        // Then
        assertThat(result.getMetadata()).isNotNull();
        assertThat(result.getMetadata().getVersion()).isEqualTo("1.0");
        assertThat(result.getMetadata().getTotalRecords().getUsers()).isEqualTo(1);
        assertThat(result.getMetadata().getTotalRecords().getEvents()).isEqualTo(1);
        assertThat(result.getMetadata().getTotalRecords().getReleases()).isEqualTo(1);
        assertThat(result.getData().getUsers()).hasSize(1);
        assertThat(result.getData().getEvents()).hasSize(1);
    }

    @Test
    void importDatabase_WithValidData_ShouldImportSuccessfully() {
        // Given
        DatabaseImportRequest request = new DatabaseImportRequest();

        ExportMetadata metadata = new ExportMetadata();
        metadata.setVersion("1.0");
        TotalRecords totalRecords = new TotalRecords();
        totalRecords.setUsers(1);
        totalRecords.setEvents(1);
        metadata.setTotalRecords(totalRecords);
        request.setMetadata(metadata);

        ExportData data = new ExportData();
        data.setUsers(Collections.singletonList(testUser));
        data.setEvents(Collections.singletonList(testEvent));
        data.setReleases(new ArrayList<>());
        data.setHistory(new ArrayList<>());
        data.setReleaseHistory(new ArrayList<>());
        data.setSettings(new ArrayList<>());
        request.setData(data);

        when(userRepository.saveAll(anyList())).thenReturn(Collections.singletonList(testUser));
        when(eventRepository.saveAll(anyList())).thenReturn(Collections.singletonList(testEvent));

        // When
        ImportDatabaseResponse result = adminService.importDatabase(request);

        // Then
        assertThat(result.getMessage()).isEqualTo("Base de données importée avec succès");
        assertThat(result.getImportedRecords().getUsers()).isEqualTo(1);
        verify(userRepository).deleteAll();
        verify(eventRepository).deleteAll();
        verify(userRepository).saveAll(anyList());
        verify(eventRepository).saveAll(anyList());
    }

    @Test
    void importDatabase_WithInvalidVersion_ShouldThrowException() {
        // Given
        DatabaseImportRequest request = new DatabaseImportRequest();

        ExportMetadata metadata = new ExportMetadata();
        metadata.setVersion("2.0");
        request.setMetadata(metadata);

        ExportData data = new ExportData();
        request.setData(data);

        // When & Then
        assertThatThrownBy(() -> adminService.importDatabase(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Version du fichier non supportée");
    }

    @Test
    void importDatabase_WithNullData_ShouldThrowException() {
        // Given
        DatabaseImportRequest request = new DatabaseImportRequest();
        request.setData(null);
        request.setMetadata(new ExportMetadata());

        // When & Then
        assertThatThrownBy(() -> adminService.importDatabase(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Format de données invalide");
    }

    @Test
    void importDatabase_WithNullMetadata_ShouldThrowException() {
        // Given
        DatabaseImportRequest request = new DatabaseImportRequest();
        request.setData(new ExportData());
        request.setMetadata(null);

        // When & Then
        assertThatThrownBy(() -> adminService.importDatabase(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Format de données invalide");
    }

    @Test
    void importDatabase_WithReleasesHavingNestedRelations_ShouldSetBidirectionalRelationships() {
        // Given
        DatabaseImportRequest request = new DatabaseImportRequest();

        ExportMetadata metadata = new ExportMetadata();
        metadata.setVersion("1.0");
        metadata.setTotalRecords(new TotalRecords());
        request.setMetadata(metadata);

        Release release = new Release();
        release.setId("rel1");

        Squad squad = new Squad();
        squad.setId("squad1");
        release.setSquads(List.of(squad));

        ExportData data = new ExportData();
        data.setUsers(new ArrayList<>());
        data.setEvents(new ArrayList<>());
        data.setReleases(List.of(release));
        data.setHistory(new ArrayList<>());
        data.setReleaseHistory(new ArrayList<>());
        data.setSettings(new ArrayList<>());
        request.setData(data);

        when(releaseRepository.saveAll(anyList())).thenReturn(List.of(release));

        // When
        adminService.importDatabase(request);

        // Then
        verify(releaseRepository).saveAll(argThat(releases -> {
            List<Release> releaseList = new ArrayList<>();
            releases.forEach(releaseList::add);
            Release r = releaseList.get(0);
            assertThat(r.getSquads().get(0).getRelease()).isEqualTo(r);
            return true;
        }));
    }

    @Test
    void createAdminUser_WhenNotExists_ShouldCreateAdmin() {
        // Given
        when(userRepository.existsByEmail("admin")).thenReturn(false);
        when(passwordEncoder.encode("admin123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        adminService.createAdminUser();

        // Then
        verify(userRepository).save(argThat(user -> {
            assertThat(user.getEmail()).isEqualTo("admin");
            assertThat(user.getFirstName()).isEqualTo("Admin");
            assertThat(user.getLastName()).isEqualTo("Système");
            assertThat(user.getPassword()).isEqualTo("encoded-password");
            return true;
        }));
    }

    @Test
    void createAdminUser_WhenAlreadyExists_ShouldNotCreate() {
        // Given
        when(userRepository.existsByEmail("admin")).thenReturn(true);

        // When
        adminService.createAdminUser();

        // Then
        verify(userRepository, never()).save(any(User.class));
    }
}
