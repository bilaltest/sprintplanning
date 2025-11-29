import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '@services/settings.service';
import { Theme, Language, WeekStart, UserPreferences } from '@models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center space-x-3">
        <span class="material-icons text-3xl text-primary-600 dark:text-primary-400">settings</span>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
      </div>

      <!-- Theme -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Apparence
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thème
            </label>
            <div class="flex space-x-4">
              <button
                (click)="setTheme('light')"
                [class.ring-2]="preferences.theme === 'light'"
                [class.ring-primary-500]="preferences.theme === 'light'"
                class="flex items-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
              >
                <span class="material-icons text-gray-700 dark:text-gray-300">light_mode</span>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Clair</span>
              </button>

              <button
                (click)="setTheme('dark')"
                [class.ring-2]="preferences.theme === 'dark'"
                [class.ring-primary-500]="preferences.theme === 'dark'"
                class="flex items-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
              >
                <span class="material-icons text-gray-700 dark:text-gray-300">dark_mode</span>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Sombre</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Language -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Langue
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Langue de l'interface
            </label>
            <div class="flex space-x-4">
              <button
                (click)="setLanguage('fr')"
                [class.ring-2]="preferences.language === 'fr'"
                [class.ring-primary-500]="preferences.language === 'fr'"
                class="flex items-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
              >
                <span class="text-2xl">🇫🇷</span>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Français</span>
              </button>

              <button
                (click)="setLanguage('en')"
                [class.ring-2]="preferences.language === 'en'"
                [class.ring-primary-500]="preferences.language === 'en'"
                class="flex items-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
              >
                <span class="text-2xl">🇬🇧</span>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">English</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Calendrier
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Premier jour de la semaine
            </label>
            <div class="flex space-x-4">
              <button
                (click)="setWeekStart('monday')"
                [class.ring-2]="preferences.weekStart === 'monday'"
                [class.ring-primary-500]="preferences.weekStart === 'monday'"
                class="flex items-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
              >
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Lundi</span>
              </button>

              <button
                (click)="setWeekStart('sunday')"
                [class.ring-2]="preferences.weekStart === 'sunday'"
                [class.ring-primary-500]="preferences.weekStart === 'sunday'"
                class="flex items-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
              >
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Dimanche</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions
        </h2>

        <div class="space-y-3">
          <button
            (click)="resetToDefaults()"
            class="btn btn-secondary w-full justify-center"
          >
            Réinitialiser aux valeurs par défaut
          </button>

          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            Cette action restaurera tous les paramètres à leurs valeurs par défaut
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SettingsComponent implements OnInit {
  preferences: UserPreferences = {
    theme: 'light',
    language: 'fr',
    weekStart: 'monday',
    customColors: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.preferences$.subscribe(prefs => {
      this.preferences = prefs;
    });
  }

  async setTheme(theme: Theme): Promise<void> {
    await this.settingsService.setTheme(theme);
  }

  async setLanguage(language: Language): Promise<void> {
    await this.settingsService.setLanguage(language);
  }

  async setWeekStart(weekStart: WeekStart): Promise<void> {
    await this.settingsService.setWeekStart(weekStart);
  }

  async resetToDefaults(): Promise<void> {
    const confirmed = confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?');
    if (confirmed) {
      await this.settingsService.resetToDefaults();
    }
  }
}
