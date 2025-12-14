import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermissionService } from '@services/permission.service';

/**
 * Guard pour protéger les routes du module RELEASES
 * Nécessite au moins READ sur RELEASES
 */
export const releasesGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  // Vérifier si l'utilisateur a au moins READ sur RELEASES
  if (permissionService.hasReadAccess('RELEASES')) {
    return true;
  }

  // Rediriger vers l'accueil si pas de permission
  router.navigate(['/home']);
  return false;
};
