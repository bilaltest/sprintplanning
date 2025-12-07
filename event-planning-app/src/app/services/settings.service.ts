import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { UserPreferences, DEFAULT_PREFERENCES, Theme } from '@models/settings.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;

  private preferencesSubject = new BehaviorSubject<UserPreferences>(DEFAULT_PREFERENCES);
  public preferences$: Observable<UserPreferences> = this.preferencesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadPreferences();
  }

  private async loadPreferences(): Promise<void> {
    try {
      const prefs = await firstValueFrom(
        this.http.get<UserPreferences>(this.apiUrl)
      );
      this.preferencesSubject.next(prefs);
      // Ne pas appliquer le thème ici, c'est géré par AuthService via AppComponent
    } catch (error) {
      // En cas d'erreur, utiliser les préférences par défaut
      this.preferencesSubject.next(DEFAULT_PREFERENCES);
    }
  }

  private async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      const updated = await firstValueFrom(
        this.http.put<UserPreferences>(this.apiUrl, preferences)
      );
      this.preferencesSubject.next(updated);
    } catch (error) {
      throw error;
    }
  }

  async setTheme(theme: Theme): Promise<void> {
    // Utiliser AuthService pour sauvegarder le thème dans les préférences utilisateur
    await this.authService.updatePreferences(theme);
    this.applyTheme(theme);
  }

  async resetToDefaults(): Promise<void> {
    const current = this.preferencesSubject.value;
    await this.savePreferences({
      ...DEFAULT_PREFERENCES,
      id: current.id,
      createdAt: current.createdAt
    });

    // Réinitialiser aussi le thème utilisateur
    await this.authService.updatePreferences('light');
    this.applyTheme('light');
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

  async toggleTheme(): Promise<void> {
    const user = this.authService.getCurrentUser();
    const currentTheme = user?.themePreference || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    await this.setTheme(newTheme);
  }
}
