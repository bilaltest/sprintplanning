package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.service.OnboardingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final OnboardingService onboardingService;

    @GetMapping("/status")
    public ResponseEntity<List<String>> getSeenKeys(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(onboardingService.getSeenKeys(userId));
    }

    @PostMapping("/seen/{key}")
    public ResponseEntity<Void> markAsSeen(
            @PathVariable String key,
            Authentication authentication) {
        String userId = (String) authentication.getPrincipal(); // userId is passed as principal by
                                                                // JwtAuthenticationFilter
        onboardingService.markAsSeen(userId, key);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/skip-all")
    public ResponseEntity<Void> skipAll(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        onboardingService.markAllAsSeen(userId);
        return ResponseEntity.ok().build();
    }
}
