import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SettingsService } from '@services/settings.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <!-- Header -->
      <header *ngIf="isAuthenticated$ | async" class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span class="material-icons text-white text-xl">calendar_month</span>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                  Planning DSI
                </h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Gestion d'événements
                </p>
              </div>
            </div>

            <!-- Navigation -->
            <nav class="flex items-center space-x-1">
              <a
                routerLink="/planning"
                routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                [routerLinkActiveOptions]="{ exact: false }"
                class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <span class="material-icons text-lg">event</span>
                <span>Planning</span>
              </a>
              <a
                routerLink="/history"
                routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <span class="material-icons text-lg">history</span>
                <span>Historique</span>
              </a>
              <a
                routerLink="/settings"
                routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <span class="material-icons text-lg">settings</span>
                <span>Paramètres</span>
              </a>
            </nav>

            <!-- Actions -->
            <div class="flex items-center space-x-2">
              <!-- Theme toggle -->
              <button
                (click)="toggleTheme()"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Changer de thème"
              >
                <span class="material-icons text-gray-600 dark:text-gray-300">
                  {{ isDarkMode ? 'light_mode' : 'dark_mode' }}
                </span>
              </button>

              <!-- Logout button -->
              <button
                (click)="logout()"
                class="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center space-x-2"
                title="Déconnexion"
              >
                <span class="material-icons text-lg">logout</span>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent {
  isDarkMode = false;
  isAuthenticated$ = this.authService.isAuthenticated$;

  constructor(
    private settingsService: SettingsService,
    private authService: AuthService,
    private router: Router
  ) {
    // Utilisation de takeUntilDestroyed pour éviter les memory leaks
    this.settingsService.preferences$
      .pipe(takeUntilDestroyed())
      .subscribe(prefs => {
        this.isDarkMode = prefs.theme === 'dark';
      });
  }

  toggleTheme(): void {
    this.settingsService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
