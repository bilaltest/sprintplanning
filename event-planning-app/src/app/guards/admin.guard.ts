import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();

  // Vérifier si l'utilisateur est connecté et si c'est l'admin
  if (currentUser && currentUser.email === 'admin') {
    return true;
  }

  // Rediriger vers l'accueil si pas admin
  router.navigate(['/home']);
  return false;
};
