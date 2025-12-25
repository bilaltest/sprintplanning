package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.BlogCommentDto;
import com.catsbanque.mabanquetools.dto.CreateBlogCommentRequest;
import com.catsbanque.mabanquetools.service.BlogCommentService;
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
 * Controller REST pour la gestion des commentaires du blog.
 *
 * Permissions:
 * - GET (lecture): BLOG_READ ou BLOG_WRITE
 * - POST (création): BLOG_READ ou BLOG_WRITE (tout le monde peut commenter)
 * - DELETE (suppression): BLOG_WRITE ou être l'auteur
 */
@RestController
@RequestMapping("/blog/comments")
@RequiredArgsConstructor
@Slf4j
public class BlogCommentController {

    private final BlogCommentService commentService;
    private final JwtUtil jwtUtil;

    /**
     * GET /blog/comments?postId=xxx
     * Liste tous les commentaires d'un post.
     * Permission: BLOG_READ minimum
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<List<BlogCommentDto>> getComments(@RequestParam String postId) {
        log.info("GET /blog/comments?postId={} - Récupération des commentaires", postId);
        List<BlogCommentDto> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    /**
     * POST /blog/comments
     * Crée un nouveau commentaire (top-level ou réponse).
     * Permission: BLOG_READ minimum (tout le monde peut commenter)
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<BlogCommentDto> createComment(
            @Valid @RequestBody CreateBlogCommentRequest request,
            HttpServletRequest httpRequest) {
        log.info("POST /blog/comments - Création d'un commentaire sur post: {}", request.getPostId());

        // Extraire l'ID de l'auteur depuis le JWT
        String authorId = jwtUtil.extractUserIdFromRequest(httpRequest)
                .orElseThrow(() -> new RuntimeException("Utilisateur non authentifié"));

        BlogCommentDto comment = commentService.createComment(request, authorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    /**
     * DELETE /blog/comments/:id
     * Supprime un commentaire.
     * Permission: Être l'auteur du commentaire
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        log.info("DELETE /blog/comments/{} - Suppression du commentaire", id);

        // Extraire l'ID de l'utilisateur courant depuis le JWT
        String currentUserId = jwtUtil.extractUserIdFromRequest(httpRequest)
                .orElseThrow(() -> new RuntimeException("Utilisateur non authentifié"));

        commentService.deleteComment(id, currentUserId);
        return ResponseEntity.noContent().build();
    }
}
