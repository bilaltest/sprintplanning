import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { UserPreferences, DEFAULT_PREFERENCES, Theme, Language, WeekStart, ColorCustomization } from '@models/settings.model';
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

  async setLanguage(language: Language): Promise<void> {
    const current = this.preferencesSubject.value;
    await this.savePreferences({ ...current, language });
  }

  async setWeekStart(weekStart: WeekStart): Promise<void> {
    const current = this.preferencesSubject.value;
    await this.savePreferences({ ...current, weekStart });
  }

  async addCustomColor(color: ColorCustomization): Promise<void> {
    const current = this.preferencesSubject.value;
    const customColors = [...current.customColors, color];
    await this.savePreferences({ ...current, customColors });
  }

  async removeCustomColor(name: string): Promise<void> {
    const current = this.preferencesSubject.value;
    const customColors = current.customColors.filter(c => c.name !== name);
    await this.savePreferences({ ...current, customColors });
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

  toggleTheme(): void {
    const current = this.preferencesSubject.value;
    const newTheme = current.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}
