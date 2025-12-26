package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.BlogImageDto;
import com.catsbanque.mabanquetools.service.BlogImageService;
import com.catsbanque.mabanquetools.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Controller REST pour la gestion des images du blog.
 *
 * Permissions:
 * - GET (lecture): BLOG_READ ou BLOG_WRITE
 * - POST/DELETE (écriture): BLOG_WRITE uniquement
 */
@RestController
@RequestMapping("/blog/images")
@RequiredArgsConstructor
@Slf4j
public class BlogImageController {

    private final BlogImageService blogImageService;
    private final JwtUtil jwtUtil;

    /**
     * POST /blog/images/upload
     * Upload une image avec génération de thumbnail.
     * Permission: BLOG_WRITE requis
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('PERMISSION_BLOG_WRITE')")
    public ResponseEntity<BlogImageDto> uploadImage(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        log.info("POST /blog/images/upload - Upload d'une image: {}", file.getOriginalFilename());

        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Utilisateur non authentifié"));

        try {
            BlogImageDto image = blogImageService.uploadImage(file, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(image);
        } catch (IOException e) {
            log.error("Erreur lors de l'upload de l'image", e);
            throw new RuntimeException("Erreur lors de l'upload de l'image: " + e.getMessage());
        }
    }

    /**
     * GET /blog/images
     * Liste toutes les images (thumbnails uniquement).
     * Permission: BLOG_READ minimum
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<List<BlogImageDto>> getAllImages() {
        log.info("GET /blog/images - Récupération de toutes les images");
        List<BlogImageDto> images = blogImageService.getAllImages();
        return ResponseEntity.ok(images);
    }

    /**
     * GET /blog/images/:id
     * Récupère une image complète par son ID (avec imageData).
     * Permission: BLOG_READ minimum
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<BlogImageDto> getImageById(@PathVariable String id) {
        log.info("GET /blog/images/{} - Récupération image complète", id);
        BlogImageDto image = blogImageService.getImageById(id);
        return ResponseEntity.ok(image);
    }

    /**
     * DELETE /blog/images/:id
     * Supprime une image (ownership check).
     * Permission: BLOG_WRITE requis
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_BLOG_WRITE')")
    public ResponseEntity<Void> deleteImage(
            @PathVariable String id,
            HttpServletRequest request) {

        log.info("DELETE /blog/images/{} - Suppression de l'image", id);

        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Utilisateur non authentifié"));

        blogImageService.deleteImage(id, userId);
        return ResponseEntity.noContent().build();
    }
}
