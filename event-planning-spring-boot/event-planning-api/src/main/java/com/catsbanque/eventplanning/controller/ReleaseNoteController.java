package com.catsbanque.eventplanning.controller;

import com.catsbanque.eventplanning.dto.CreateReleaseNoteEntryRequest;
import com.catsbanque.eventplanning.dto.ReleaseNoteEntryDto;
import com.catsbanque.eventplanning.service.ReleaseNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/releases/{releaseId}/release-notes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('PERMISSION_RELEASES_READ', 'PERMISSION_RELEASES_WRITE')")
public class ReleaseNoteController {

    private final ReleaseNoteService releaseNoteService;

    /**
     * GET : Récupère toutes les entrées de release note pour une release
     */
    @GetMapping
    public ResponseEntity<List<ReleaseNoteEntryDto>> getAllEntries(@PathVariable String releaseId) {
        List<ReleaseNoteEntryDto> entries = releaseNoteService.getAllEntries(releaseId);
        return ResponseEntity.ok(entries);
    }

    /**
     * POST : Crée une nouvelle entrée de release note
     */
    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<ReleaseNoteEntryDto> createEntry(
            @PathVariable String releaseId,
            @Valid @RequestBody CreateReleaseNoteEntryRequest request
    ) {
        ReleaseNoteEntryDto created = releaseNoteService.createEntry(releaseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT : Met à jour une entrée de release note
     */
    @PutMapping("/{entryId}")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<ReleaseNoteEntryDto> updateEntry(
            @PathVariable String releaseId,
            @PathVariable String entryId,
            @Valid @RequestBody CreateReleaseNoteEntryRequest request
    ) {
        ReleaseNoteEntryDto updated = releaseNoteService.updateEntry(releaseId, entryId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE : Supprime une entrée de release note
     */
    @DeleteMapping("/{entryId}")
    @PreAuthorize("hasAuthority('PERMISSION_RELEASES_WRITE')")
    public ResponseEntity<Void> deleteEntry(
            @PathVariable String releaseId,
            @PathVariable String entryId
    ) {
        releaseNoteService.deleteEntry(releaseId, entryId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET : Exporte la release note en Markdown
     */
    @GetMapping("/export/markdown")
    public ResponseEntity<String> exportMarkdown(@PathVariable String releaseId) {
        String markdown = releaseNoteService.exportMarkdown(releaseId);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_MARKDOWN)
                .header("Content-Disposition", "attachment; filename=release-note.md")
                .body(markdown);
    }

    /**
     * GET : Exporte la release note en HTML
     */
    @GetMapping("/export/html")
    public ResponseEntity<String> exportHtml(@PathVariable String releaseId) {
        String html = releaseNoteService.exportHtml(releaseId);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .header("Content-Disposition", "attachment; filename=release-note.html")
                .body(html);
    }
}
