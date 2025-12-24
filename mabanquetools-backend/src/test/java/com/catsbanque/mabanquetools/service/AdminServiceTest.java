package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.AdminStatsResponse;
import com.catsbanque.mabanquetools.dto.AdminUpdateUserRequest;
import com.catsbanque.mabanquetools.dto.AdminUserDto;
import com.catsbanque.mabanquetools.dto.AdminUsersResponse;
import com.catsbanque.mabanquetools.dto.DeletedUserResponse;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.repository.EventRepository;
import com.catsbanque.mabanquetools.repository.HistoryRepository;
import com.catsbanque.mabanquetools.repository.ReleaseHistoryRepository;
import com.catsbanque.mabanquetools.repository.ReleaseRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.catsbanque.mabanquetools.repository.TeamRepository;
import com.catsbanque.mabanquetools.entity.Team;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminService - Unit Tests")
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
    private PermissionService permissionService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private TeamRepository teamRepository;

    @InjectMocks
    private AdminService adminService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("user-1");
        testUser.setEmail("test@test.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
    }

    @Test
    @DisplayName("getAllUsers - Success")
    void testGetAllUsers() {
        // Given
        when(userRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(testUser));
        when(historyRepository.findByUserIdOrderByTimestampDesc("user-1")).thenReturn(Collections.emptyList());
        when(permissionService.getUserPermissions("user-1")).thenReturn(Collections.emptyMap());

        // When
        AdminUsersResponse response = adminService.getAllUsers();

        // Then
        assertEquals(1, response.getUsers().size());
        assertEquals("user-1", response.getUsers().getFirst().getId());
    }

    @Test
    @DisplayName("deleteUser - Success")
    void testDeleteUser() {
        // Given
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        // Mock history updates
        when(historyRepository.findByUserIdOrderByTimestampDesc("user-1")).thenReturn(Collections.emptyList());
        when(releaseHistoryRepository.findByUserIdOrderByTimestampDesc("user-1")).thenReturn(Collections.emptyList());

        // When
        DeletedUserResponse response = adminService.deleteUser("user-1");

        // Then
        verify(userRepository).delete(testUser);
        assertNotNull(response);
    }

    @Test
    @DisplayName("updateUser - Success")
    void testUpdateUser() {
        // Given
        AdminUpdateUserRequest request = new AdminUpdateUserRequest();
        request.setFirstName("Updated");
        request.setSquads(List.of("Squad A"));

        Team teamA = new Team();
        teamA.setName("Squad A");

        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        when(teamRepository.findByName("Squad A")).thenReturn(Optional.of(teamA));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(permissionService.getUserPermissions(anyString())).thenReturn(Collections.emptyMap());
        when(historyRepository.findByUserIdOrderByTimestampDesc(anyString())).thenReturn(Collections.emptyList());

        // When
        AdminUserDto result = adminService.updateUser("user-1", request);

        // Then
        assertEquals("Updated", result.getFirstName());
        assertEquals(List.of("Squad A"), result.getSquads());
    }

    @Test
    @DisplayName("resetUserPassword - Success")
    void testResetUserPassword() {
        // Given
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("password")).thenReturn("encoded-password");

        // When
        adminService.resetUserPassword("user-1");

        // Then
        verify(userRepository).save(testUser);
        assertEquals("encoded-password", testUser.getPassword());
    }

    @Test
    @DisplayName("getStats - Success")
    void testGetStats() {
        // Given
        when(userRepository.count()).thenReturn(10L);
        when(eventRepository.count()).thenReturn(5L);
        when(releaseRepository.count()).thenReturn(2L);
        when(historyRepository.count()).thenReturn(100L);

        // When
        AdminStatsResponse response = adminService.getStats();

        // Then
        assertEquals(10, response.getStats().getTotalUsers());
        assertEquals(5, response.getStats().getTotalEvents());
    }

    @Test
    @DisplayName("updateUser - Not Found")
    void testUpdateUser_NotFound() {
        when(userRepository.findById("unknown")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> adminService.updateUser("unknown", new AdminUpdateUserRequest()));
    }

    @Test
    @DisplayName("getAllSquads - Success")
    void testGetAllSquads() {
        // Given
        Team t1 = new Team();
        t1.setName("Squad 1");
        Team t2 = new Team();
        t2.setName("Squad 2");
        when(teamRepository.findAll()).thenReturn(List.of(t1, t2));

        // When
        List<String> squads = adminService.getAllSquads();

        // Then
        assertNotNull(squads);
        assertTrue(squads.contains("Squad 1"));
        assertTrue(squads.contains("Squad 2"));
        assertEquals(2, squads.size());
    }
}
