package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.dto.BlogNotificationDto;
import com.catsbanque.mabanquetools.service.BlogNotificationService;
import com.catsbanque.mabanquetools.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST pour la gestion des notifications blog
 * Base URL: /blog/notifications
 */
@RestController
@RequestMapping("/blog/notifications")
@RequiredArgsConstructor
@Slf4j
public class BlogNotificationController {

    private final BlogNotificationService blogNotificationService;
    private final JwtUtil jwtUtil;

    /**
     * GET /blog/notifications - Toutes les notifications de l'utilisateur connecté
     * Permissions: BLOG_READ ou BLOG_WRITE
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<List<BlogNotificationDto>> getUserNotifications(HttpServletRequest request) {
        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        List<BlogNotificationDto> notifications = blogNotificationService.getUserNotifications(userId);
        log.info("Récupération de {} notifications pour user {}", notifications.size(), userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * GET /blog/notifications/unread - Notifications non lues uniquement
     * Permissions: BLOG_READ ou BLOG_WRITE
     */
    @GetMapping("/unread")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<List<BlogNotificationDto>> getUnreadNotifications(HttpServletRequest request) {
        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        List<BlogNotificationDto> notifications = blogNotificationService.getUnreadNotifications(userId);
        log.info("Récupération de {} notifications non lues pour user {}", notifications.size(), userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * GET /blog/notifications/unread-count - Nombre de notifications non lues
     * Permissions: BLOG_READ ou BLOG_WRITE
     */
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(HttpServletRequest request) {
        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        long count = blogNotificationService.getUnreadCount(userId);
        log.info("Comptage notifications non lues pour user {}: {}", userId, count);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * PATCH /blog/notifications/:id/mark-read - Marquer une notification comme lue
     * Permissions: BLOG_READ ou BLOG_WRITE
     */
    @PatchMapping("/{id}/mark-read")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<Void> markAsRead(@PathVariable String id, HttpServletRequest request) {
        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        blogNotificationService.markAsRead(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /blog/notifications/mark-all-read - Marquer toutes les notifications comme lues
     * Permissions: BLOG_READ ou BLOG_WRITE
     */
    @PatchMapping("/mark-all-read")
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<Void> markAllAsRead(HttpServletRequest request) {
        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        blogNotificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
