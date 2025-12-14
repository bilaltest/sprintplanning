import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermissionService } from '@services/permission.service';

/**
 * Guard pour protéger les routes du module ADMIN
 * Nécessite au moins READ sur ADMIN
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  // Vérifier si l'utilisateur a au moins READ sur ADMIN
  if (permissionService.hasReadAccess('ADMIN')) {
    return true;
  }

  // Rediriger vers l'accueil si pas admin
  router.navigate(['/home']);
  return false;
};
