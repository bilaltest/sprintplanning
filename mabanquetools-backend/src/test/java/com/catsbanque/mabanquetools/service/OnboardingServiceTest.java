package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.entity.UserOnboardingStatus;
import com.catsbanque.mabanquetools.repository.UserOnboardingStatusRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OnboardingServiceTest {

    @Mock
    private UserOnboardingStatusRepository onboardingRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OnboardingService onboardingService;

    private User user;
    private final String USER_ID = "user-123";

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(USER_ID);
        user.setEmail("test@example.com");
    }

    @Test
    void getSeenKeys_ShouldReturnListOfKeys() {
        // Arrange
        UserOnboardingStatus status1 = new UserOnboardingStatus(user, "WELCOME");
        status1.setSeenAt(LocalDateTime.now());
        UserOnboardingStatus status2 = new UserOnboardingStatus(user, "FEATURE_CALENDAR");
        status2.setSeenAt(LocalDateTime.now());

        when(onboardingRepository.findByUserId(USER_ID)).thenReturn(Arrays.asList(status1, status2));

        // Act
        List<String> seenKeys = onboardingService.getSeenKeys(USER_ID);

        // Assert
        assertEquals(2, seenKeys.size());
        assertTrue(seenKeys.contains("WELCOME"));
        assertTrue(seenKeys.contains("FEATURE_CALENDAR"));
        verify(onboardingRepository).findByUserId(USER_ID);
    }

    @Test
    void getSeenKeys_ShouldReturnEmptyList_WhenNoTipsSeen() {
        // Arrange
        when(onboardingRepository.findByUserId(USER_ID)).thenReturn(Collections.emptyList());

        // Act
        List<String> seenKeys = onboardingService.getSeenKeys(USER_ID);

        // Assert
        assertTrue(seenKeys.isEmpty());
    }

    @Test
    void markAsSeen_ShouldSaveNewStatus_WhenNotSeenYet() {
        // Arrange
        String featureKey = "FEATURE_NEW";
        when(onboardingRepository.existsByUserIdAndFeatureKey(USER_ID, featureKey)).thenReturn(false);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

        // Act
        onboardingService.markAsSeen(USER_ID, featureKey);

        // Assert
        verify(onboardingRepository).save(any(UserOnboardingStatus.class));
    }

    @Test
    void markAsSeen_ShouldDoNothing_WhenAlreadySeen() {
        // Arrange
        String featureKey = "WELCOME";
        when(onboardingRepository.existsByUserIdAndFeatureKey(USER_ID, featureKey)).thenReturn(true);

        // Act
        onboardingService.markAsSeen(USER_ID, featureKey);

        // Assert
        verify(userRepository, never()).findById(any());
        verify(onboardingRepository, never()).save(any());
    }

    @Test
    void markAsSeen_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        String featureKey = "FEATURE_NEW";
        when(onboardingRepository.existsByUserIdAndFeatureKey(USER_ID, featureKey)).thenReturn(false);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> onboardingService.markAsSeen(USER_ID, featureKey));
    }

    @Test
    void markAllAsSeen_ShouldSaveStatusForAllKeys() {
        // Arrange
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        // Simulate that WELCOME is already seen, but others are not
        when(onboardingRepository.existsByUserIdAndFeatureKey(USER_ID, "WELCOME")).thenReturn(true);
        when(onboardingRepository.existsByUserIdAndFeatureKey(USER_ID, "FEATURE_RELEASES")).thenReturn(false);
        when(onboardingRepository.existsByUserIdAndFeatureKey(USER_ID, "FEATURE_ABSENCE")).thenReturn(false);
        when(onboardingRepository.existsByUserIdAndFeatureKey(USER_ID, "FEATURE_CALENDAR")).thenReturn(false);
        when(onboardingRepository.existsByUserIdAndFeatureKey(USER_ID, "TOUR_HOME")).thenReturn(false);
        when(onboardingRepository.existsByUserIdAndFeatureKey(USER_ID, "TOUR_ABSENCE")).thenReturn(false);

        // Act
        onboardingService.markAllAsSeen(USER_ID);

        // Assert
        // Should verify save is called for the 5 unseen keys
        verify(onboardingRepository, times(5)).save(any(UserOnboardingStatus.class));
    }
}
