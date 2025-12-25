import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermissionService } from '../services/permission.service';

/**
 * Guard to protect blog routes.
 * Requires READ permission on BLOG module.
 * Redirects to /home if user doesn't have access.
 */
export const blogGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const hasAccess = permissionService.hasReadAccess('BLOG');

  if (!hasAccess) {
    console.warn('Access denied to blog - redirecting to /home');
    router.navigate(['/home']);
    return false;
  }

  return true;
};
