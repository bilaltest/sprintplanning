import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermissionService } from '@services/permission.service';

/**
 * Guard pour protéger les routes du module PLAYGROUND
 * Nécessite au moins READ sur PLAYGROUND
 */
export const playgroundGuard: CanActivateFn = (route, state) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);

    // Vérifier si l'utilisateur a au moins READ sur PLAYGROUND
    if (permissionService.hasReadAccess('PLAYGROUND')) {
        return true;
    }

    // Rediriger vers l'accueil si pas de permission
    router.navigate(['/home']);
    return false;
};
