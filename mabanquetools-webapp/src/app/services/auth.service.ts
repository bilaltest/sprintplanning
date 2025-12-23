import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type PermissionModule = 'CALENDAR' | 'RELEASES' | 'ADMIN' | 'ABSENCE' | 'PLAYGROUND';
export type PermissionLevel = 'NONE' | 'READ' | 'WRITE';

export interface UserPermissions {
  CALENDAR: PermissionLevel;
  RELEASES: PermissionLevel;
  ADMIN: PermissionLevel;
  ABSENCE: PermissionLevel;
  PLAYGROUND: PermissionLevel;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  themePreference: 'light' | 'dark';
  widgetOrder: string; // JSON string containing widget order array
  permissions?: UserPermissions;
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

interface RegisterResponse {
  message: string;
  user: User;
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly STORAGE_KEY = 'planning_auth_token';
  private readonly USER_KEY = 'planning_user';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkInitialAuth());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  private checkInitialAuth(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Enregistre un nouvel utilisateur
   */
  async register(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<RegisterResponse>(`${this.API_URL}/register`, { email, password })
      );

      return { success: true, message: response.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.error?.error || 'Erreur lors de la création du compte'
      };
    }
  }

  /**
   * Authentifie l'utilisateur avec email et mot de passe
   */
  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.API_URL}/login`, { email, password })
      );

      // Stocker le token et les infos utilisateur
      localStorage.setItem(this.STORAGE_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(response.user);

      return { success: true, message: response.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.error?.error || 'Erreur lors de la connexion'
      };
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Récupère le token actuel
   */
  getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Récupère les informations de l'utilisateur depuis l'API
   */
  async fetchCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await firstValueFrom(
        this.http.get<{ user: User }>(`${this.API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );

      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);

      return response.user;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Met à jour les préférences de l'utilisateur
   */
  async updatePreferences(themePreference: 'light' | 'dark'): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      const response = await firstValueFrom(
        this.http.put<{ user: User; message: string }>(`${this.API_URL}/preferences`,
          { themePreference },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      // Mettre à jour l'utilisateur stocké
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);

      // Appliquer le thème immédiatement
      this.applyTheme(themePreference);

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      return false;
    }
  }

  /**
   * Applique le thème à l'élément HTML
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  /**
   * Met à jour l'ordre des widgets pour l'utilisateur
   */
  async updateWidgetOrder(widgetOrder: string[]): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      const response = await firstValueFrom(
        this.http.put<{ user: User; message: string }>(`${this.API_URL}/widget-order`,
          { widgetOrder },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      // Mettre à jour l'utilisateur stocké
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ordre des widgets:', error);
      return false;
    }
  }

  /**
   * Récupère l'ordre des widgets de l'utilisateur
   */
  getWidgetOrder(): string[] {
    const user = this.getCurrentUser();
    if (!user || !user.widgetOrder) {
      return [];
    }

    try {
      return JSON.parse(user.widgetOrder);
    } catch (error) {
      console.error('Erreur lors du parsing de widgetOrder:', error);
      return [];
    }
  }

  /**
   * Retourne le nom d'affichage de l'utilisateur au format "Prenom N."
   */
  getUserDisplayName(user: User | null = null): string {
    const currentUser = user || this.getCurrentUser();
    if (!currentUser) {
      return 'Utilisateur';
    }

    return `${currentUser.firstName} ${currentUser.lastName.charAt(0)}.`;
  }

  /**
   * Change le mot de passe de l'utilisateur
   */
  async changePassword(password: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'Non authentifié' };
      }

      await firstValueFrom(
        this.http.post<void>(`${this.API_URL}/change-password`,
          { newPassword: password },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      return { success: true, message: 'Mot de passe modifié avec succès' };
    } catch (error: any) {
      return {
        success: false,
        message: error.error?.error || 'Erreur lors du changement de mot de passe'
      };
    }
  }

}
