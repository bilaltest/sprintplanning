import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermissionService } from '@services/permission.service';

/**
 * Guard pour protéger les routes du module ABSENCE
 * Nécessite au moins READ sur ABSENCE
 */
export const absenceGuard: CanActivateFn = (route, state) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);

    // Vérifier si l'utilisateur a au moins READ sur ABSENCE
    if (permissionService.hasReadAccess('ABSENCE')) {
        return true;
    }

    // Rediriger vers l'accueil si pas accès
    router.navigate(['/home']);
    return false;
};
