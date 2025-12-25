package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.BlogPostDto;
import com.catsbanque.mabanquetools.dto.CreateBlogPostRequest;
import com.catsbanque.mabanquetools.dto.UpdateBlogPostRequest;
import com.catsbanque.mabanquetools.service.BlogPostService;
import com.catsbanque.mabanquetools.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour la gestion des posts du blog.
 *
 * Permissions:
 * - GET (lecture): BLOG_READ ou BLOG_WRITE
 * - POST/PUT/DELETE (écriture): BLOG_WRITE uniquement
 */
@RestController
@RequestMapping("/blog/posts")
@RequiredArgsConstructor
@Slf4j
public class BlogPostController {

    private final BlogPostService blogPostService;
    private final JwtUtil jwtUtil;

    /**
     * GET /blog/posts
     * Liste tous les posts publiés.
     * Permission: BLOG_READ minimum
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<List<BlogPostDto>> getAllPosts() {
        log.info("GET /blog/posts - Récupération de tous les posts");
        List<BlogPostDto> posts = blogPostService.getAllPublishedPosts();
        return ResponseEntity.ok(posts);
    }

    /**
     * GET /blog/posts/:slugOrId
     * Récupère un post par son slug ou ID.
     * Permission: BLOG_READ minimum
     */
    @GetMapping("/{slugOrId}")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<BlogPostDto> getPost(
            @PathVariable String slugOrId,
            HttpServletRequest request) {
        log.info("GET /blog/posts/{} - Récupération du post", slugOrId);

        // Extraire l'ID de l'utilisateur courant depuis le JWT (optionnel)
        String currentUserId = jwtUtil.extractUserIdFromRequest(request).orElse(null);

        BlogPostDto post = blogPostService.getPostBySlugOrId(slugOrId, currentUserId);
        return ResponseEntity.ok(post);
    }

    /**
     * POST /blog/posts
     * Crée un nouveau post (status: DRAFT).
     * Permission: BLOG_WRITE requis
     */
    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_BLOG_WRITE')")
    public ResponseEntity<BlogPostDto> createPost(
            @Valid @RequestBody CreateBlogPostRequest request,
            HttpServletRequest httpRequest) {
        log.info("POST /blog/posts - Création d'un post: {}", request.getTitle());

        // Extraire l'ID de l'auteur depuis le JWT
        String authorId = jwtUtil.extractUserIdFromRequest(httpRequest)
                .orElseThrow(() -> new RuntimeException("Utilisateur non authentifié"));

        BlogPostDto post = blogPostService.createPost(request, authorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    /**
     * PUT /blog/posts/:id
     * Met à jour un post existant.
     * Permission: BLOG_WRITE requis + être l'auteur
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_BLOG_WRITE')")
    public ResponseEntity<BlogPostDto> updatePost(
            @PathVariable String id,
            @Valid @RequestBody UpdateBlogPostRequest request,
            HttpServletRequest httpRequest) {
        log.info("PUT /blog/posts/{} - Mise à jour du post", id);

        // Extraire l'ID de l'utilisateur courant depuis le JWT
        String currentUserId = jwtUtil.extractUserIdFromRequest(httpRequest)
                .orElseThrow(() -> new RuntimeException("Utilisateur non authentifié"));

        BlogPostDto post = blogPostService.updatePost(id, request, currentUserId);
        return ResponseEntity.ok(post);
    }

    /**
     * PUT /blog/posts/:id/publish
     * Publie un post (DRAFT → PUBLISHED).
     * Permission: BLOG_WRITE requis + être l'auteur
     */
    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAuthority('PERMISSION_BLOG_WRITE')")
    public ResponseEntity<BlogPostDto> publishPost(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        log.info("PUT /blog/posts/{}/publish - Publication du post", id);

        // Extraire l'ID de l'utilisateur courant depuis le JWT
        String currentUserId = jwtUtil.extractUserIdFromRequest(httpRequest)
                .orElseThrow(() -> new RuntimeException("Utilisateur non authentifié"));

        BlogPostDto post = blogPostService.publishPost(id, currentUserId);
        return ResponseEntity.ok(post);
    }

    /**
     * DELETE /blog/posts/:id
     * Supprime un post.
     * Permission: BLOG_WRITE requis + être l'auteur
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_BLOG_WRITE')")
    public ResponseEntity<Void> deletePost(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        log.info("DELETE /blog/posts/{} - Suppression du post", id);

        // Extraire l'ID de l'utilisateur courant depuis le JWT
        String currentUserId = jwtUtil.extractUserIdFromRequest(httpRequest)
                .orElseThrow(() -> new RuntimeException("Utilisateur non authentifié"));

        blogPostService.deletePost(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /blog/posts/:id/like
     * Toggle like sur un post (ajoute ou retire).
     * Permission: BLOG_READ minimum (tout le monde peut liker)
     */
    @PostMapping("/{id}/like")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<BlogPostDto> toggleLike(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        log.info("POST /blog/posts/{}/like - Toggle like", id);

        // Extraire l'ID de l'utilisateur courant depuis le JWT
        String currentUserId = jwtUtil.extractUserIdFromRequest(httpRequest)
                .orElseThrow(() -> new RuntimeException("Utilisateur non authentifié"));

        BlogPostDto post = blogPostService.toggleLike(id, currentUserId);
        return ResponseEntity.ok(post);
    }
}
