package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.entity.PermissionLevel;
import com.catsbanque.mabanquetools.entity.PermissionModule;
import com.catsbanque.mabanquetools.entity.User;
import com.catsbanque.mabanquetools.entity.UserPermission;
import com.catsbanque.mabanquetools.repository.UserPermissionRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service de gestion des permissions utilisateurs.
 *
 * Responsabilités:
 * - Vérifier les accès READ/WRITE sur les modules
 * - Créer les permissions par défaut lors de l'inscription
 * - Mettre à jour les permissions (admin uniquement)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionService {

    private final UserPermissionRepository permissionRepository;
    private final UserRepository userRepository;

    /**
     * Récupère toutes les permissions d'un utilisateur sous forme de Map.
     *
     * @param userId l'ID de l'utilisateur
     * @return Map<Module, Level>
     */
    public Map<PermissionModule, PermissionLevel> getUserPermissions(String userId) {
        List<UserPermission> permissions = permissionRepository.findByUserId(userId);

        Map<PermissionModule, PermissionLevel> permissionsMap = new HashMap<>();
        for (UserPermission permission : permissions) {
            permissionsMap.put(permission.getModule(), permission.getPermissionLevel());
        }

        // Si aucune permission n'existe (cas anormal), retourner des permissions vides
        if (permissionsMap.isEmpty()) {
            log.warn("Aucune permission trouvée pour l'utilisateur {}", userId);
            return getDefaultPermissions();
        }

        return permissionsMap;
    }

    /**
     * Vérifie si un utilisateur a accès en LECTURE (READ ou WRITE) à un module.
     *
     * @param userId l'ID de l'utilisateur
     * @param module le module à vérifier
     * @return true si accès READ ou WRITE, false sinon
     */
    public boolean hasReadAccess(String userId, PermissionModule module) {
        PermissionLevel level = getPermissionLevel(userId, module);
        return level == PermissionLevel.READ || level == PermissionLevel.WRITE;
    }

    /**
     * Vérifie si un utilisateur a accès en ÉCRITURE (WRITE uniquement) à un module.
     *
     * @param userId l'ID de l'utilisateur
     * @param module le module à vérifier
     * @return true si accès WRITE, false sinon
     */
    public boolean hasWriteAccess(String userId, PermissionModule module) {
        PermissionLevel level = getPermissionLevel(userId, module);
        return level == PermissionLevel.WRITE;
    }

    /**
     * Récupère le niveau de permission pour un module spécifique.
     *
     * @param userId l'ID de l'utilisateur
     * @param module le module
     * @return le niveau de permission (NONE par défaut si introuvable)
     */
    public PermissionLevel getPermissionLevel(String userId, PermissionModule module) {
        return permissionRepository.findByUserIdAndModule(userId, module)
                .map(UserPermission::getPermissionLevel)
                .orElse(PermissionLevel.NONE);
    }

    /**
     * Crée les permissions par défaut pour un nouvel utilisateur.
     * Cette méthode est idempotente : elle vérifie si la permission existe avant de
     * la créer.
     *
     * Permissions par défaut (WRITE pour tous les modules):
     * - CALENDAR: WRITE
     * - RELEASES: WRITE
     * - ADMIN: WRITE
     *
     * @param user l'utilisateur pour lequel créer les permissions
     */
    @Transactional
    public void createDefaultPermissions(User user) {
        createOrUpdatePermission(user, PermissionModule.CALENDAR, PermissionLevel.WRITE);
        createOrUpdatePermission(user, PermissionModule.RELEASES, PermissionLevel.WRITE);
        createOrUpdatePermission(user, PermissionModule.ADMIN, PermissionLevel.WRITE);
        createOrUpdatePermission(user, PermissionModule.ABSENCE, PermissionLevel.WRITE);

        log.info("Permissions par défaut vérifiées/créées pour l'utilisateur {}", user.getEmail());
    }

    /**
     * Helper pour créer ou mettre à jour une permission spécifique
     */
    private void createOrUpdatePermission(User user, PermissionModule module, PermissionLevel level) {
        permissionRepository.findByUserIdAndModule(user.getId(), module)
                .ifPresentOrElse(
                        perm -> {
                            if (perm.getPermissionLevel() != level) {
                                perm.setPermissionLevel(level);
                                permissionRepository.save(perm);
                                log.debug("Permission {} mise à jour pour {}", module, user.getEmail());
                            }
                        },
                        () -> {
                            UserPermission newPerm = new UserPermission();
                            newPerm.setUserId(user.getId());
                            newPerm.setModule(module);
                            newPerm.setPermissionLevel(level);
                            permissionRepository.save(newPerm);
                            log.debug("Permission {} créée pour {}", module, user.getEmail());
                        });
    }

    /**
     * Met à jour les permissions d'un utilisateur.
     *
     * @param userId         l'ID de l'utilisateur
     * @param newPermissions Map des nouvelles permissions
     */
    @Transactional
    public void updateUserPermissions(String userId, Map<PermissionModule, PermissionLevel> newPermissions) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + userId));

        for (Map.Entry<PermissionModule, PermissionLevel> entry : newPermissions.entrySet()) {
            PermissionModule module = entry.getKey();
            PermissionLevel newLevel = entry.getValue();

            UserPermission permission = permissionRepository.findByUserIdAndModule(userId, module)
                    .orElse(null);

            if (permission != null) {
                // Mise à jour de la permission existante
                permission.setPermissionLevel(newLevel);
                permissionRepository.save(permission);
            } else {
                // Création d'une nouvelle permission
                UserPermission newPermission = new UserPermission();
                newPermission.setUserId(user.getId());
                newPermission.setModule(module);
                newPermission.setPermissionLevel(newLevel);
                permissionRepository.save(newPermission);
            }
        }

        log.info("Permissions mises à jour pour l'utilisateur {}: {}", userId, newPermissions);
    }

    /**
     * Retourne les permissions par défaut (utilisées en cas d'erreur).
     *
     * @return Map des permissions par défaut
     */
    private Map<PermissionModule, PermissionLevel> getDefaultPermissions() {
        Map<PermissionModule, PermissionLevel> defaults = new HashMap<>();
        defaults.put(PermissionModule.CALENDAR, PermissionLevel.WRITE);
        defaults.put(PermissionModule.RELEASES, PermissionLevel.WRITE);
        defaults.put(PermissionModule.ADMIN, PermissionLevel.NONE);
        defaults.put(PermissionModule.ABSENCE, PermissionLevel.WRITE);
        return defaults;
    }
}
