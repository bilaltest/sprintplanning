import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SettingsService } from '@services/settings.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-releases-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-950">
      <!-- Simplified Header for Releases -->
      <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <!-- Logo/Home Button -->
            <button
              (click)="navigateToHome()"
              class="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <span class="material-icons text-primary-600 dark:text-primary-400 text-3xl">
                rocket_launch
              </span>
              <span class="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                Releases MEP
              </span>
            </button>

            <!-- Right Actions -->
            <div class="flex items-center space-x-2">
              <!-- Theme Toggle -->
              <button
                (click)="toggleTheme()"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Changer le thème"
              >
                <span class="material-icons text-gray-600 dark:text-gray-300">
                  {{ (settingsService.preferences$ | async)?.theme === 'dark' ? 'light_mode' : 'dark_mode' }}
                </span>
              </button>

              <!-- Logout -->
              <button
                (click)="logout()"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Se déconnecter"
              >
                <span class="material-icons text-gray-600 dark:text-gray-300">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="max-w-7xl mx-auto px-4 py-6">
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
export class ReleasesLayoutComponent {
  constructor(
    private router: Router,
    public settingsService: SettingsService,
    private authService: AuthService
  ) {}

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  toggleTheme(): void {
    this.settingsService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
