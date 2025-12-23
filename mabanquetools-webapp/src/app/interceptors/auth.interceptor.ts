import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Intercepteur HTTP pour ajouter automatiquement le token JWT
 * à toutes les requêtes HTTP sortantes.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Récupérer le token depuis localStorage
  const token = localStorage.getItem('planning_auth_token');

  // Si pas de token, laisser passer la requête telle quelle
  if (!token) {
    return next(req);
  }

  // Cloner la requête et ajouter le header Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  // Envoyer la requête modifiée
  return next(authReq);
};
