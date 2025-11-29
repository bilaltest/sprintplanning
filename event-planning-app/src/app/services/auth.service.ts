import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'planning_auth_token';
  private readonly TEMP_PASSWORD = 'NMB'; // Mot de passe temporaire

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkInitialAuth());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor() {}

  private checkInitialAuth(): boolean {
    return !!sessionStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Authentifie l'utilisateur avec un mot de passe simple
   * Plus tard, cette méthode appelera une API d'authentification externe
   */
  async login(password: string): Promise<boolean> {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ password })
    // });

    if (password === this.TEMP_PASSWORD) {
      const token = this.generateTempToken();
      sessionStorage.setItem(this.STORAGE_KEY, token);
      this.isAuthenticatedSubject.next(true);
      return true;
    }

    return false;
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Génère un token temporaire
   * Plus tard, le token sera fourni par l'API
   */
  private generateTempToken(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Récupère le token actuel
   * Utile pour les appels API futurs
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.STORAGE_KEY);
  }
}
