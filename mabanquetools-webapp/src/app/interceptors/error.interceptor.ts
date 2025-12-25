import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

// Variable statique pour éviter les redirections multiples
let hasRedirectedForServerError = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';
      let errorTitle = 'Erreur';

      if (error.error instanceof ErrorEvent) {
        // Erreur côté client (réseau, timeout, etc.)
        errorTitle = 'Erreur de connexion';
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
      } else {
        // Erreur côté serveur
        switch (error.status) {
          case 0:
            // Backend indisponible
            if (!hasRedirectedForServerError) {
              hasRedirectedForServerError = true;

              // Déconnecter l'utilisateur
              authService.logout();

              // Afficher UN SEUL toast
              toastService.error(
                'Serveur indisponible',
                'Vous avez été déconnecté suite à l\'indisponibilité du serveur.',
                10000 // Toast plus long (10s)
              );

              // Rediriger vers /login
              router.navigate(['/login']);

              // Reset le flag après 5 secondes (pour permettre un nouveau cycle si besoin)
              setTimeout(() => {
                hasRedirectedForServerError = false;
              }, 5000);
            }
            // Ne PAS afficher de toast supplémentaire si déjà redirigé
            return throwError(() => error);
          break;
          case 401:
            errorTitle = 'Non autorisé';
            errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
            break;
          case 403:
            // Ne pas afficher de toast pour les erreurs 403
            // car elles devraient être gérées en amont par la vérification des permissions
            console.warn('403 Forbidden: Permissions insuffisantes pour cette action');
            return throwError(() => error);
          case 404:
            errorTitle = 'Ressource introuvable';
            errorMessage = error.error?.error?.message || 'La ressource demandée n\'existe pas.';
            break;
          case 500:
            errorTitle = 'Erreur serveur';
            errorMessage = 'Une erreur interne est survenue sur le serveur.';
            break;
          default:
            errorTitle = `Erreur ${error.status}`;
            errorMessage = error.error?.error?.message || error.message;
        }
      }

      // Afficher le toast d'erreur (sauf pour les erreurs réseau status 0 déjà gérées)
      if (error.status !== 0) {
        toastService.error(errorTitle, errorMessage, 7000);
      }

      // Propager l'erreur pour que les composants puissent la gérer
      return throwError(() => error);
    })
  );
};
