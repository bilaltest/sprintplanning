import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { AuthService, User } from './auth.service';

export type PermissionModule = 'CALENDAR' | 'RELEASES' | 'ADMIN';
export type PermissionLevel = 'NONE' | 'READ' | 'WRITE';

export interface UserPermissions {
  CALENDAR: PermissionLevel;
  RELEASES: PermissionLevel;
  ADMIN: PermissionLevel;
}

export interface UpdatePermissionsRequest {
  permissions: Partial<UserPermissions>;
}

export interface UserPermissionsResponse {
  userId: string;
  permissions: UserPermissions;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly API_URL = 'http://localhost:3000/api/admin/permissions';

  private permissionsSubject = new BehaviorSubject<UserPermissions | null>(null);
  public permissions$: Observable<UserPermissions | null> = this.permissionsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Charger les permissions depuis le user stocké
    this.loadPermissionsFromUser();

    // S'abonner aux changements de l'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.loadPermissionsFromUser();
    });
  }

  private loadPermissionsFromUser(): void {
    const user = this.authService.getCurrentUser();
    if (user && (user as any).permissions) {
      this.permissionsSubject.next((user as any).permissions);
    } else {
      this.permissionsSubject.next(null);
    }
  }

  /**
   * Récupère les permissions de l'utilisateur actuel
   */
  getCurrentUserPermissions(): UserPermissions | null {
    return this.permissionsSubject.value;
  }

  /**
   * Vérifie si l'utilisateur a au moins READ sur un module
   */
  hasReadAccess(module: PermissionModule): boolean {
    const permissions = this.getCurrentUserPermissions();
    if (!permissions) return false;
    const level = permissions[module];
    return level === 'READ' || level === 'WRITE';
  }

  /**
   * Vérifie si l'utilisateur a WRITE sur un module
   */
  hasWriteAccess(module: PermissionModule): boolean {
    const permissions = this.getCurrentUserPermissions();
    if (!permissions) return false;
    return permissions[module] === 'WRITE';
  }

  /**
   * Récupère les permissions d'un utilisateur (admin only)
   */
  async getUserPermissions(userId: string): Promise<UserPermissionsResponse> {
    return await firstValueFrom(
      this.http.get<UserPermissionsResponse>(`${this.API_URL}/${userId}`)
    );
  }

  /**
   * Met à jour les permissions d'un utilisateur (admin only)
   */
  async updateUserPermissions(userId: string, permissions: Partial<UserPermissions>): Promise<UserPermissionsResponse> {
    return await firstValueFrom(
      this.http.put<UserPermissionsResponse>(`${this.API_URL}/${userId}`, { permissions })
    );
  }

  /**
   * Retourne un message tooltip pour un bouton désactivé
   */
  getDisabledTooltip(module: PermissionModule, action: 'read' | 'write' = 'write'): string {
    const moduleNames: Record<PermissionModule, string> = {
      CALENDAR: 'Calendrier',
      RELEASES: 'Préparation des MEP',
      ADMIN: 'Administration'
    };

    const actionText = action === 'write' ? 'modifier' : 'consulter';
    return `Vous n'avez pas les permissions pour ${actionText} le module ${moduleNames[module]}`;
  }
}
