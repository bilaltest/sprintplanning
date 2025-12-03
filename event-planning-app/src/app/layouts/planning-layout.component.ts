import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SettingsService } from '@services/settings.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-planning-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-950">
      <!-- Header avec gradient Planning -->
      <header class="bg-gradient-planning sticky top-0 z-40 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <!-- Logo/Home Button -->
            <button
              (click)="navigateToHome()"
              class="flex items-center space-x-2 hover:scale-105 transition-transform"
            >
              <span class="material-icons text-white text-3xl drop-shadow-md">
                calendar_month
              </span>
              <span class="text-xl font-bold text-white hidden sm:block drop-shadow-md">
                Event Planning
              </span>
            </button>

            <!-- Navigation -->
            <nav class="flex items-center space-x-2">
              <a
                routerLink="/planning"
                routerLinkActive="bg-white/20 backdrop-blur-sm shadow-md"
                [routerLinkActiveOptions]="{exact: false}"
                class="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-white/10 text-white"
              >
                Planning
              </a>
              <a
                routerLink="/history"
                routerLinkActive="bg-white/20 backdrop-blur-sm shadow-md"
                class="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-white/10 text-white"
              >
                Historique
              </a>
              <a
                routerLink="/settings"
                routerLinkActive="bg-white/20 backdrop-blur-sm shadow-md"
                class="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-white/10 text-white"
              >
                Paramètres
              </a>

              <!-- Divider -->
              <div class="h-6 w-px bg-white/30 mx-2"></div>

              <!-- Theme Toggle -->
              <button
                (click)="toggleTheme()"
                class="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                title="Changer le thème"
              >
                <span class="material-icons text-white">
                  {{ (settingsService.preferences$ | async)?.theme === 'dark' ? 'light_mode' : 'dark_mode' }}
                </span>
              </button>

              <!-- Logout -->
              <button
                (click)="logout()"
                class="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                title="Se déconnecter"
              >
                <span class="material-icons text-white">logout</span>
              </button>
            </nav>
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
export class PlanningLayoutComponent {
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
