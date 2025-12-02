import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SettingsService } from '@services/settings.service';
import { ToastService } from '@services/toast.service';
import { EventService } from '@services/event.service';
import { ReleaseService } from '@services/release.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col">
      <!-- Simple Header with Theme Toggle -->
      <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4">
        <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Event Planning App
          </h1>
          <button
            (click)="toggleTheme()"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Changer le thème"
          >
            <span class="material-icons text-gray-600 dark:text-gray-300">
              {{ (settingsService.preferences$ | async)?.theme === 'dark' ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 flex items-center justify-center p-8">
        <div class="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Planning Card -->
          <div
            (click)="navigateToPlanning()"
            class="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 p-8 relative"
          >
            <!-- Badge de notification -->
            <div
              *ngIf="(eventsCount$ | async) as count"
              class="absolute -top-3 -right-3 bg-primary-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg font-bold text-lg animate-pulse"
            >
              {{ count }}
            </div>

            <div class="flex flex-col items-center text-center space-y-6">
              <div class="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span class="material-icons text-primary-600 dark:text-primary-400" style="font-size: 48px;">
                  calendar_month
                </span>
              </div>
              <div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Planning
                </h2>
                <p class="text-gray-600 dark:text-gray-400 text-lg">
                  Gérez vos événements et planifiez vos activités
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  <span *ngIf="(eventsCount$ | async) as count">
                    {{ count }} événement{{ count > 1 ? 's' : '' }} enregistré{{ count > 1 ? 's' : '' }}
                  </span>
                </p>
              </div>
              <div class="flex items-center text-primary-600 dark:text-primary-400 font-medium">
                <span>Accéder</span>
                <span class="material-icons ml-2 group-hover:translate-x-2 transition-transform duration-300">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>

          <!-- Releases Card -->
          <div
            (click)="navigateToReleases()"
            class="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 p-8 relative"
          >
            <!-- Badge de notification -->
            <div
              *ngIf="(releasesCount$ | async) as count"
              class="absolute -top-3 -right-3 bg-primary-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg font-bold text-lg animate-pulse"
            >
              {{ count }}
            </div>

            <div class="flex flex-col items-center text-center space-y-6">
              <div class="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span class="material-icons text-primary-600 dark:text-primary-400" style="font-size: 48px;">
                  rocket_launch
                </span>
              </div>
              <div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Releases
                </h2>
                <p class="text-gray-600 dark:text-gray-400 text-lg">
                  Gérez vos mises en production et releases
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  <span *ngIf="(releasesCount$ | async) as count">
                    {{ count }} release{{ count > 1 ? 's' : '' }} en cours
                  </span>
                </p>
              </div>
              <div class="flex items-center text-primary-600 dark:text-primary-400 font-medium">
                <span>Accéder</span>
                <span class="material-icons ml-2 group-hover:translate-x-2 transition-transform duration-300">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class HomeComponent implements OnInit {
  eventsCount$!: Observable<number>;
  releasesCount$!: Observable<number>;

  constructor(
    private router: Router,
    public settingsService: SettingsService,
    private toastService: ToastService,
    private eventService: EventService,
    private releaseService: ReleaseService
  ) {}

  ngOnInit(): void {
    // Calculer le nombre d'événements
    this.eventsCount$ = this.eventService.events$.pipe(
      map(events => events.length)
    );

    // Calculer le nombre de releases
    this.releasesCount$ = this.releaseService.releases$.pipe(
      map(releases => releases.length)
    );

    // Charger les releases au démarrage
    this.releaseService.loadReleases();
  }

  navigateToPlanning(): void {
    this.router.navigate(['/planning']);
  }

  navigateToReleases(): void {
    this.router.navigate(['/releases']);
  }

  toggleTheme(): void {
    this.settingsService.toggleTheme();
  }
}
