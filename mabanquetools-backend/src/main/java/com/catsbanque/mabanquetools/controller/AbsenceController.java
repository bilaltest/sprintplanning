package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.AbsenceDto;
import com.catsbanque.mabanquetools.dto.AbsenceUserDto;
import com.catsbanque.mabanquetools.dto.CreateAbsenceRequest;
import com.catsbanque.mabanquetools.service.AbsenceService;
import com.catsbanque.mabanquetools.service.PermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/absences")
@RequiredArgsConstructor
@Slf4j
public class AbsenceController {

    private final AbsenceService absenceService;

    @GetMapping
    public ResponseEntity<List<AbsenceDto>> getAbsences(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        // Default range: -3 months to +12 months if not provided (handled by frontend
        // usually, but good to have defaults)
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusMonths(3);
        LocalDate end = endDate != null ? endDate : LocalDate.now().plusMonths(12);

        return ResponseEntity.ok(absenceService.getAbsences(userId, start, end));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AbsenceUserDto>> getAbsenceUsers(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(absenceService.getAbsenceUsers(userId));
    }

    @PostMapping
    public ResponseEntity<AbsenceDto> createAbsence(
            @RequestBody CreateAbsenceRequest request,
            Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(absenceService.createAbsence(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AbsenceDto> updateAbsence(
            @PathVariable String id,
            @RequestBody CreateAbsenceRequest request,
            Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(absenceService.updateAbsence(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAbsence(
            @PathVariable String id,
            Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        absenceService.deleteAbsence(userId, id);
        return ResponseEntity.noContent().build();
    }
}
