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
      <!-- Header Releases - Gradient énergique -->
      <header class="bg-gradient-releases sticky top-0 z-40 shadow-xl">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <!-- Logo/Home Button -->
            <button
              (click)="navigateToHome()"
              class="flex items-center space-x-3 hover:scale-105 transition-transform group"
            >
              <span class="material-icons text-white text-4xl drop-shadow-lg group-hover:rotate-12 transition-transform">
                rocket_launch
              </span>
              <div class="hidden sm:block">
                <span class="text-xl font-bold text-white block drop-shadow-md">
                  Releases MEP
                </span>
                <span class="text-xs text-white/80 font-medium">
                  Gestion des déploiements
                </span>
              </div>
            </button>

            <!-- Right Actions -->
            <div class="flex items-center space-x-2">
              <!-- Theme Toggle -->
              <button
                (click)="toggleTheme()"
                class="p-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 hover:shadow-md"
                title="Changer le thème"
              >
                <span class="material-icons text-white text-xl">
                  {{ (settingsService.preferences$ | async)?.theme === 'dark' ? 'light_mode' : 'dark_mode' }}
                </span>
              </button>

              <!-- Logout -->
              <button
                (click)="logout()"
                class="p-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 hover:shadow-md"
                title="Se déconnecter"
              >
                <span class="material-icons text-white text-xl">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Content avec fond subtil -->
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
