package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.entity.UserOnboardingStatus;
import com.catsbanque.mabanquetools.repository.UserOnboardingStatusRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OnboardingService {

    private final UserOnboardingStatusRepository onboardingRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<String> getSeenKeys(String userId) {
        return onboardingRepository.findByUserId(userId).stream()
                .map(UserOnboardingStatus::getFeatureKey)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsSeen(String userId, String featureKey) {
        if (onboardingRepository.existsByUserIdAndFeatureKey(userId, featureKey)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        UserOnboardingStatus status = new UserOnboardingStatus(user, featureKey);
        onboardingRepository.save(status);
        log.info("Marked onboarding key '{}' as seen for user '{}'", featureKey, userId);
    }

    @Transactional
    public void markAllAsSeen(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<String> allKeys = List.of("WELCOME", "FEATURE_RELEASES", "FEATURE_ABSENCE", "FEATURE_CALENDAR",
                "TOUR_HOME", "TOUR_ABSENCE");

        for (String key : allKeys) {
            if (!onboardingRepository.existsByUserIdAndFeatureKey(userId, key)) {
                UserOnboardingStatus status = new UserOnboardingStatus(user, key);
                onboardingRepository.save(status);
            }
        }
        log.info("Marked all onboarding keys as seen for user '{}'", userId);
    }
}
