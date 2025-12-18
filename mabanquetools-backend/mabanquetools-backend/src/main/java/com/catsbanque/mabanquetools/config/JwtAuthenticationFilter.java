package com.catsbanque.mabanquetools.config;

import com.catsbanque.mabanquetools.entity.PermissionLevel;
import com.catsbanque.mabanquetools.entity.PermissionModule;
import com.catsbanque.mabanquetools.service.PermissionService;
import com.catsbanque.mabanquetools.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Filtre d'authentification JWT.
 *
 * Intercepte toutes les requêtes HTTP et valide le token JWT présent dans le header Authorization.
 * Si le token est valide, l'utilisateur est authentifié dans le SecurityContext.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final PermissionService permissionService;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String TOKEN_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Récupérer le header Authorization
        String authHeader = request.getHeader(AUTHORIZATION_HEADER);

        // Si pas de header ou ne commence pas par "Bearer ", ignorer
        if (authHeader == null || !authHeader.startsWith(TOKEN_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Extraire le token
            String token = authHeader.substring(TOKEN_PREFIX.length());

            // Valider le token et extraire l'userId
            String userId = jwtUtil.extractUserId(token);

            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Charger les permissions de l'utilisateur et les convertir en GrantedAuthorities
                List<GrantedAuthority> authorities = loadUserAuthorities(userId);

                // Créer l'authentification (utilisateur authentifié)
                // Le principal est l'userId
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                authorities // Charger les permissions comme GrantedAuthorities
                        );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Définir l'authentification dans le SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("Utilisateur authentifié via JWT: {} avec {} authorities", userId, authorities.size());
            }

        } catch (JwtException e) {
            log.warn("Token JWT invalide: {}", e.getMessage());
            // Ne pas bloquer la requête, laisser Spring Security gérer l'accès non autorisé
        } catch (Exception e) {
            log.error("Erreur lors de l'authentification JWT: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Charge les permissions de l'utilisateur depuis la base de données
     * et les convertit en GrantedAuthorities pour Spring Security.
     *
     * Format des authorities: "PERMISSION_{MODULE}_{LEVEL}"
     * Exemples:
     * - PERMISSION_CALENDAR_WRITE
     * - PERMISSION_RELEASES_READ
     * - PERMISSION_ADMIN_NONE
     *
     * @param userId l'ID de l'utilisateur
     * @return liste des GrantedAuthorities
     */
    private List<GrantedAuthority> loadUserAuthorities(String userId) {
        List<GrantedAuthority> authorities = new ArrayList<>();

        try {
            // Récupérer les permissions de l'utilisateur
            Map<PermissionModule, PermissionLevel> permissions = permissionService.getUserPermissions(userId);

            // Convertir chaque permission en GrantedAuthority
            for (Map.Entry<PermissionModule, PermissionLevel> entry : permissions.entrySet()) {
                PermissionModule module = entry.getKey();
                PermissionLevel level = entry.getValue();

                // Format: PERMISSION_{MODULE}_{LEVEL}
                String authority = String.format("PERMISSION_%s_%s", module.name(), level.name());
                authorities.add(new SimpleGrantedAuthority(authority));

                log.debug("Authority ajoutée: {}", authority);
            }

            // Ajouter une authority générique pour marquer l'utilisateur comme authentifié
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

        } catch (Exception e) {
            log.error("Erreur lors du chargement des permissions pour userId {}: {}", userId, e.getMessage());
            // En cas d'erreur, retourner au minimum ROLE_USER pour que l'utilisateur soit authentifié
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }

        return authorities;
    }
}
