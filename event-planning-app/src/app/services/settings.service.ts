import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { UserPreferences, DEFAULT_PREFERENCES, Theme } from '@models/settings.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;

  private preferencesSubject = new BehaviorSubject<UserPreferences>(DEFAULT_PREFERENCES);
  public preferences$: Observable<UserPreferences> = this.preferencesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPreferences();
  }

  private async loadPreferences(): Promise<void> {
    try {
      const prefs = await firstValueFrom(
        this.http.get<UserPreferences>(this.apiUrl)
      );
      console.log('SettingsService - Préférences chargées depuis le backend:', prefs);
      this.preferencesSubject.next(prefs);
      this.applyTheme(prefs.theme);
    } catch (error) {
      console.error('Error loading preferences:', error);
      // En cas d'erreur, utiliser les préférences par défaut
      this.preferencesSubject.next(DEFAULT_PREFERENCES);
      this.applyTheme(DEFAULT_PREFERENCES.theme);
    }
  }

  private async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      const updated = await firstValueFrom(
        this.http.put<UserPreferences>(this.apiUrl, preferences)
      );
      this.preferencesSubject.next(updated);
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  async setTheme(theme: Theme): Promise<void> {
    const current = this.preferencesSubject.value;
    await this.savePreferences({ ...current, theme });
    this.applyTheme(theme);
  }

  async resetToDefaults(): Promise<void> {
    const current = this.preferencesSubject.value;
    await this.savePreferences({
      ...DEFAULT_PREFERENCES,
      id: current.id,
      createdAt: current.createdAt
    });
    this.applyTheme(DEFAULT_PREFERENCES.theme);
  }

  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  getCurrentPreferences(): UserPreferences {
    return this.preferencesSubject.value;
  }

  async updatePreferences(preferences: UserPreferences): Promise<void> {
    await this.savePreferences(preferences);
  }

  toggleTheme(): void {
    const current = this.preferencesSubject.value;
    const newTheme = current.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}
