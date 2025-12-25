package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.BlogTagDto;
import com.catsbanque.mabanquetools.dto.CreateBlogTagRequest;
import com.catsbanque.mabanquetools.service.BlogTagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour la gestion des tags du blog.
 *
 * Permissions:
 * - GET (lecture): BLOG_READ ou BLOG_WRITE
 * - POST/DELETE (gestion): BLOG_WRITE uniquement
 */
@RestController
@RequestMapping("/blog/tags")
@RequiredArgsConstructor
@Slf4j
public class BlogTagController {

    private final BlogTagService tagService;

    /**
     * GET /blog/tags
     * Liste tous les tags.
     * Permission: BLOG_READ minimum
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<List<BlogTagDto>> getAllTags() {
        log.info("GET /blog/tags - Récupération de tous les tags");
        List<BlogTagDto> tags = tagService.getAllTags();
        return ResponseEntity.ok(tags);
    }

    /**
     * GET /blog/tags/:id
     * Récupère un tag par son ID.
     * Permission: BLOG_READ minimum
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<BlogTagDto> getTag(@PathVariable String id) {
        log.info("GET /blog/tags/{} - Récupération du tag", id);
        BlogTagDto tag = tagService.getTagById(id);
        return ResponseEntity.ok(tag);
    }

    /**
     * POST /blog/tags
     * Crée un nouveau tag.
     * Permission: BLOG_WRITE requis
     */
    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_BLOG_WRITE')")
    public ResponseEntity<BlogTagDto> createTag(@Valid @RequestBody CreateBlogTagRequest request) {
        log.info("POST /blog/tags - Création d'un tag: {}", request.getName());
        BlogTagDto tag = tagService.createTag(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tag);
    }

    /**
     * DELETE /blog/tags/:id
     * Supprime un tag.
     * Permission: BLOG_WRITE requis
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_BLOG_WRITE')")
    public ResponseEntity<Void> deleteTag(@PathVariable String id) {
        log.info("DELETE /blog/tags/{} - Suppression du tag", id);
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}
