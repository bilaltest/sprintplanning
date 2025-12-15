package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.dto.CreateMicroserviceRequest;
import com.catsbanque.eventplanning.dto.MicroserviceDto;
import com.catsbanque.eventplanning.dto.UpdateMicroserviceRequest;
import com.catsbanque.eventplanning.service.MicroserviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/microservices")
@RequiredArgsConstructor
public class MicroserviceController {

    private final MicroserviceService microserviceService;

    /**
     * Get all active microservices
     * Requires: RELEASES READ or WRITE permission
     *
     * @param releaseId Optional release ID to compute previousTag for each microservice
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('PERMISSION_RELEASES_READ', 'PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<List<MicroserviceDto>> getAllActive(
            @RequestParam(required = false) String releaseId) {
        return ResponseEntity.ok(microserviceService.getAllActive(releaseId));
    }

    /**
     * Get all microservices (including inactive)
     * Requires: RELEASES WRITE permission
     */
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<List<MicroserviceDto>> getAll() {
        return ResponseEntity.ok(microserviceService.getAll());
    }

    /**
     * Get active microservices by squad
     * Requires: RELEASES READ or WRITE permission
     */
    @GetMapping("/squad/{squad}")
    @PreAuthorize("hasAnyAuthority('PERMISSION_RELEASES_READ', 'PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<List<MicroserviceDto>> getBySquad(@PathVariable String squad) {
        return ResponseEntity.ok(microserviceService.getActiveBySquad(squad));
    }

    /**
     * Get microservice by ID
     * Requires: RELEASES READ or WRITE permission
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PERMISSION_RELEASES_READ', 'PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<MicroserviceDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(microserviceService.getById(id));
    }

    /**
     * Create new microservice
     * Requires: RELEASES WRITE permission
     */
    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<MicroserviceDto> create(@Valid @RequestBody CreateMicroserviceRequest request) {
        MicroserviceDto created = microserviceService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update microservice
     * Requires: RELEASES WRITE permission
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<MicroserviceDto> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateMicroserviceRequest request) {
        MicroserviceDto updated = microserviceService.update(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete (soft delete) microservice
     * Requires: RELEASES WRITE permission
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        microserviceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Hard delete microservice (use with caution!)
     * Requires: RELEASES WRITE permission
     */
    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<Void> hardDelete(@PathVariable String id) {
        microserviceService.hardDelete(id);
        return ResponseEntity.noContent().build();
    }
}
