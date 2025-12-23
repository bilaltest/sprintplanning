package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.AbsenceDto;
import com.catsbanque.mabanquetools.dto.AbsenceUserDto;
import com.catsbanque.mabanquetools.dto.CreateAbsenceRequest;
import com.catsbanque.mabanquetools.entity.*;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.exception.UnauthorizedException;
import com.catsbanque.mabanquetools.repository.AbsenceRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AbsenceService - Unit Tests")
class AbsenceServiceTest {

    @Mock
    private AbsenceRepository absenceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PermissionService permissionService;

    @InjectMocks
    private AbsenceService absenceService;

    private User testUser;
    private Absence testAbsence;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("user-1");
        testUser.setFirstName("John");
        testUser.setLastName("DOE");
        testUser.setEmail("john.doe@ca-ts.fr");

        testAbsence = new Absence();
        testAbsence.setId("absence-1");
        testAbsence.setUser(testUser);
        testAbsence.setStartDate(LocalDate.now());
        testAbsence.setEndDate(LocalDate.now().plusDays(1));
        testAbsence.setType(AbsenceType.ABSENCE);
        testAbsence.setStartPeriod(Period.MORNING);
        testAbsence.setEndPeriod(Period.AFTERNOON);
    }

    @Test
    @DisplayName("getAbsences - Success")
    void testGetAbsences_Success() {
        // Given
        when(permissionService.hasReadAccess(anyString(), eq(PermissionModule.ABSENCE))).thenReturn(true);
        when(absenceRepository.findByDateRange(any(), any())).thenReturn(List.of(testAbsence));

        // When
        List<AbsenceDto> result = absenceService.getAbsences("user-1", LocalDate.now(), LocalDate.now().plusDays(5));

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("absence-1", result.getFirst().getId());
    }

    @Test
    @DisplayName("getAbsences - Unauthorized")
    void testGetAbsences_Unauthorized() {
        // Given
        when(permissionService.hasReadAccess(anyString(), eq(PermissionModule.ABSENCE))).thenReturn(false);

        // When & Then
        assertThrows(UnauthorizedException.class,
                () -> absenceService.getAbsences("user-1", LocalDate.now(), LocalDate.now()));
    }

    @Test
    @DisplayName("getAbsenceUsers - Content Check")
    void testGetAbsenceUsers() {
        // Given
        when(permissionService.hasReadAccess(anyString(), eq(PermissionModule.ABSENCE))).thenReturn(true);

        User user1 = new User();
        user1.setId("u1");
        user1.setTribu("TribuA");

        User user2 = new User(); // Should be filtered out
        user2.setId("u2");
        user2.setTribu("Autre");

        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2));

        // When
        List<AbsenceUserDto> result = absenceService.getAbsenceUsers("admin");

        // Then
        assertEquals(1, result.size());
        assertEquals("u1", result.getFirst().getId());
    }

    @Test
    @DisplayName("createAbsence - Success")
    void testCreateAbsence_Success() {
        // Given
        CreateAbsenceRequest request = new CreateAbsenceRequest();
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusDays(1));
        request.setType(AbsenceType.TELETRAVAIL);

        when(userRepository.findById(anyString())).thenReturn(Optional.of(testUser));
        when(absenceRepository.existsOverlappingAbsence(anyString(), eq("new"), any(), any(), anyString(), anyString()))
                .thenReturn(false);
        when(absenceRepository.save(any(Absence.class))).thenAnswer(inv -> {
            Absence a = inv.getArgument(0);
            a.setId("new-id");
            return a;
        });

        // Permission check: Assume user creates for themselves
        // checkWritePermission will verify permissions.
        // For self: need WRITE on ABSENCE if not admin.
        when(permissionService.hasWriteAccess("user-1", PermissionModule.ADMIN)).thenReturn(false);
        when(permissionService.hasWriteAccess("user-1", PermissionModule.ABSENCE)).thenReturn(true);

        // When
        AbsenceDto result = absenceService.createAbsence("user-1", request);

        // Then
        assertNotNull(result);
        assertEquals("new-id", result.getId());
        verify(absenceRepository).save(any(Absence.class));
    }

    @Test
    @DisplayName("createAbsence - Invalid Dates")
    void testCreateAbsence_InvalidDates() {
        // Given
        CreateAbsenceRequest request = new CreateAbsenceRequest();
        request.setStartDate(LocalDate.now().plusDays(2));
        request.setEndDate(LocalDate.now()); // End before start

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> absenceService.createAbsence("user-1", request));
    }

    @Test
    @DisplayName("createAbsence - Overlap")
    void testCreateAbsence_Overlap() {
        // Given
        CreateAbsenceRequest request = new CreateAbsenceRequest();
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now());

        when(userRepository.findById(anyString())).thenReturn(Optional.of(testUser));
        when(permissionService.hasWriteAccess("user-1", PermissionModule.ADMIN)).thenReturn(false);
        when(permissionService.hasWriteAccess("user-1", PermissionModule.ABSENCE)).thenReturn(true);
        when(absenceRepository.existsOverlappingAbsence(anyString(), anyString(), any(), any(), anyString(),
                anyString()))
                .thenReturn(true);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> absenceService.createAbsence("user-1", request));
    }

    @Test
    @DisplayName("updateAbsence - Success")
    void testUpdateAbsence_Success() {
        // Given
        CreateAbsenceRequest request = new CreateAbsenceRequest();
        request.setStartDate(LocalDate.now().plusDays(5));
        request.setEndDate(LocalDate.now().plusDays(6));
        request.setType(AbsenceType.FORMATION);

        when(absenceRepository.findById("absence-1")).thenReturn(Optional.of(testAbsence));
        when(permissionService.hasWriteAccess("user-1", PermissionModule.ADMIN)).thenReturn(false);
        when(permissionService.hasWriteAccess("user-1", PermissionModule.ABSENCE)).thenReturn(true);
        when(absenceRepository.existsOverlappingAbsence(anyString(), eq("absence-1"), any(), any(), anyString(),
                anyString()))
                .thenReturn(false);
        when(absenceRepository.save(any(Absence.class))).thenReturn(testAbsence);

        // When
        AbsenceDto result = absenceService.updateAbsence("user-1", "absence-1", request);

        // Then
        assertNotNull(result);
        assertEquals(AbsenceType.FORMATION, testAbsence.getType());
    }

    @Test
    @DisplayName("deleteAbsence - Success")
    void testDeleteAbsence_Success() {
        // Given
        when(absenceRepository.findById("absence-1")).thenReturn(Optional.of(testAbsence));
        when(permissionService.hasWriteAccess("user-1", PermissionModule.ADMIN)).thenReturn(false);
        when(permissionService.hasWriteAccess("user-1", PermissionModule.ABSENCE)).thenReturn(true);

        // When
        absenceService.deleteAbsence("user-1", "absence-1");

        // Then
        verify(absenceRepository).delete(testAbsence);
    }

    @Test
    @DisplayName("checkWritePermission - Admin can edit other")
    void testPermission_AdminEditOther() {
        // Given: Admin user editing testUser's absence
        // Admin permissions setup
        when(permissionService.hasWriteAccess("admin-user", PermissionModule.ADMIN)).thenReturn(true);

        CreateAbsenceRequest request = new CreateAbsenceRequest();
        request.setUserId("user-1"); // Target user
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now());

        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        // No overlap
        when(absenceRepository.existsOverlappingAbsence(any(), any(), any(), any(), any(), any())).thenReturn(false);
        when(absenceRepository.save(any())).thenAnswer(inv -> {
            Absence a = (Absence) inv.getArguments()[0];
            a.setUser(testUser);
            return a;
        });

        // When: Admin creates absence for user-1
        assertDoesNotThrow(() -> absenceService.createAbsence("admin-user", request));
    }

    @Test
    @DisplayName("checkWritePermission - User cannot edit other")
    void testPermission_UserEditOther_Forbidden() {
        // Given: user-2 tries to edit user-1
        CreateAbsenceRequest request = new CreateAbsenceRequest();
        request.setUserId("user-1");
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now());

        // Not admin
        when(permissionService.hasWriteAccess("user-2", PermissionModule.ADMIN)).thenReturn(false);
        // Has absence write rights (for self), but shouldn't be enough for others

        // When & Then
        assertThrows(UnauthorizedException.class, () -> absenceService.createAbsence("user-2", request));
    }
}
