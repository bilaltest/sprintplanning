import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Release,
  CreateReleaseDto,
  UpdateReleaseDto,
  Feature,
  CreateFeatureDto,
  Action,
  CreateActionDto
} from '@models/release.model';
import { PermissionService } from './permission.service';

@Injectable({
  providedIn: 'root'
})
export class ReleaseService {
  private apiUrl = `${environment.apiUrl}/releases`;

  private releasesSubject = new BehaviorSubject<Release[]>([]);
  public releases$ = this.releasesSubject.asObservable();

  private currentReleaseSubject = new BehaviorSubject<Release | null>(null);
  public currentRelease$ = this.currentReleaseSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  private permissionService = inject(PermissionService);

  constructor(private http: HttpClient) {
    // Charger les releases uniquement si l'utilisateur a les permissions
    // Attendre un tick pour que PermissionService soit initialisé
    setTimeout(() => {
      if (this.permissionService.hasReadAccess('RELEASES')) {
        this.loadReleases();
      }
    }, 0);
  }

  // ===== RELEASES =====

  async loadReleases(): Promise<void> {
    // Vérifier les permissions avant de charger
    if (!this.permissionService.hasReadAccess('RELEASES')) {
      console.warn('ReleaseService: No permission to load releases (RELEASES READ required)');
      this.errorSubject.next('Permissions insuffisantes');
      return;
    }

    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null); // Réinitialiser l'erreur
      const releases = await firstValueFrom(
        this.http.get<Release[]>(this.apiUrl)
      );
      this.releasesSubject.next(releases);
    } catch (error: any) {
      console.error('Error loading releases:', error);
      // Stocker le message d'erreur
      const errorMessage = error.status === 0
        ? 'Serveur indisponible'
        : (error.error?.error?.message || 'Erreur lors du chargement des releases');
      this.errorSubject.next(errorMessage);
      // Ne pas throw pour ne pas casser le flux
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async getRelease(id: string): Promise<Release> {
    try {
      const release = await firstValueFrom(
        this.http.get<Release>(`${this.apiUrl}/${id}`)
      );
      this.currentReleaseSubject.next(release);
      return release;
    } catch (error) {
      console.error('Error getting release:', error);
      throw error;
    }
  }

  async createRelease(dto: CreateReleaseDto): Promise<Release> {
    try {
      const release = await firstValueFrom(
        this.http.post<Release>(this.apiUrl, dto)
      );
      await this.loadReleases();
      return release;
    } catch (error) {
      console.error('Error creating release:', error);
      throw error;
    }
  }

  async updateRelease(id: string, dto: UpdateReleaseDto): Promise<Release> {
    try {
      const release = await firstValueFrom(
        this.http.put<Release>(`${this.apiUrl}/${id}`, dto)
      );

      // Update current release if it's the one being edited
      if (this.currentReleaseSubject.value?.id === id) {
        this.currentReleaseSubject.next(release);
      }

      await this.loadReleases();
      return release;
    } catch (error) {
      console.error('Error updating release:', error);
      throw error;
    }
  }

  async deleteRelease(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}/${id}`)
      );

      // Clear current release if it's the one being deleted
      if (this.currentReleaseSubject.value?.id === id) {
        this.currentReleaseSubject.next(null);
      }

      await this.loadReleases();
    } catch (error) {
      console.error('Error deleting release:', error);
      throw error;
    }
  }

  // ===== FEATURES =====

  async addFeature(squadId: string, dto: CreateFeatureDto): Promise<Feature> {
    try {
      const feature = await firstValueFrom(
        this.http.post<Feature>(`${this.apiUrl}/squads/${squadId}/features`, dto)
      );

      // Reload current release to get updated data
      if (this.currentReleaseSubject.value) {
        await this.getRelease(this.currentReleaseSubject.value.id!);
      }

      return feature;
    } catch (error) {
      console.error('Error adding feature:', error);
      throw error;
    }
  }

  async updateFeature(featureId: string, dto: CreateFeatureDto): Promise<Feature> {
    try {
      const feature = await firstValueFrom(
        this.http.put<Feature>(`${this.apiUrl}/features/${featureId}`, dto)
      );

      // Reload current release
      if (this.currentReleaseSubject.value) {
        await this.getRelease(this.currentReleaseSubject.value.id!);
      }

      return feature;
    } catch (error) {
      console.error('Error updating feature:', error);
      throw error;
    }
  }

  async deleteFeature(featureId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}/features/${featureId}`)
      );

      // Reload current release
      if (this.currentReleaseSubject.value) {
        await this.getRelease(this.currentReleaseSubject.value.id!);
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
      throw error;
    }
  }

  // ===== ACTIONS =====

  async addAction(squadId: string, dto: CreateActionDto): Promise<Action> {
    try {
      const action = await firstValueFrom(
        this.http.post<Action>(`${this.apiUrl}/squads/${squadId}/actions`, dto)
      );

      // Reload current release
      if (this.currentReleaseSubject.value) {
        await this.getRelease(this.currentReleaseSubject.value.id!);
      }

      return action;
    } catch (error) {
      console.error('Error adding action:', error);
      throw error;
    }
  }

  async updateAction(actionId: string, dto: Partial<CreateActionDto>): Promise<Action> {
    try {
      const action = await firstValueFrom(
        this.http.put<Action>(`${this.apiUrl}/actions/${actionId}`, dto)
      );

      // Reload current release
      if (this.currentReleaseSubject.value) {
        await this.getRelease(this.currentReleaseSubject.value.id!);
      }

      return action;
    } catch (error) {
      console.error('Error updating action:', error);
      throw error;
    }
  }

  async deleteAction(actionId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}/actions/${actionId}`)
      );

      // Reload current release
      if (this.currentReleaseSubject.value) {
        await this.getRelease(this.currentReleaseSubject.value.id!);
      }
    } catch (error) {
      console.error('Error deleting action:', error);
      throw error;
    }
  }

  // Helper method to toggle action status
  async toggleActionStatus(actionId: string, currentStatus: 'pending' | 'completed'): Promise<void> {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    await this.updateAction(actionId, { status: newStatus } as any);
  }

  // ===== SQUAD UPDATES =====

  async updateSquad(squadId: string, data: {
    tontonMep?: string;
    isCompleted?: boolean;
    featuresEmptyConfirmed?: boolean;
  }): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put<void>(`${this.apiUrl}/squads/${squadId}`, data)
      );

      // Reload current release
      if (this.currentReleaseSubject.value) {
        await this.getRelease(this.currentReleaseSubject.value.id!);
      }
    } catch (error) {
      console.error('Error updating squad:', error);
      throw error;
    }
  }

  async refreshReleases(): Promise<void> {
    await this.loadReleases();
    // Also refresh current release if one is selected
    if (this.currentReleaseSubject.value?.id) {
      await this.getRelease(this.currentReleaseSubject.value.id);
    }
  }
}
