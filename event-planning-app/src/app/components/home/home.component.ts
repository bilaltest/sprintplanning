import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SettingsService } from '@services/settings.service';
import { EventService } from '@services/event.service';
import { ReleaseService } from '@services/release.service';
import { Event } from '@models/event.model';
import { Release } from '@models/release.model';
import { format, isThisWeek, isFuture, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col">
      <!-- Header avec gradient vert -->
      <header class="bg-gradient-planning shadow-lg py-4">
        <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-white drop-shadow-md">
            Ma Banque Tools
          </h1>
          <button
            (click)="toggleTheme()"
            class="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            title="Changer le thème"
          >
            <span class="material-icons text-white">
              {{ (settingsService.preferences$ | async)?.theme === 'dark' ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 p-8">
        <div class="max-w-7xl mx-auto space-y-8">
          <!-- Notifications Section -->
          <div class="space-y-3" *ngIf="notifications.length > 0">
            <div *ngFor="let notification of notifications"
                 class="flex items-start space-x-3 p-4 rounded-lg border-l-4"
                 [class.bg-amber-50]="notification.type === 'warning'"
                 [class.dark:bg-amber-900/20]="notification.type === 'warning'"
                 [class.border-amber-500]="notification.type === 'warning'"
                 [class.bg-red-50]="notification.type === 'alert'"
                 [class.dark:bg-red-900/20]="notification.type === 'alert'"
                 [class.border-red-500]="notification.type === 'alert'"
                 [class.bg-green-50]="notification.type === 'success'"
                 [class.dark:bg-green-900/20]="notification.type === 'success'"
                 [class.border-green-500]="notification.type === 'success'"
                 [class.bg-blue-50]="notification.type === 'info'"
                 [class.dark:bg-blue-900/20]="notification.type === 'info'"
                 [class.border-blue-500]="notification.type === 'info'">
              <span class="material-icons text-2xl"
                    [class.text-amber-600]="notification.type === 'warning'"
                    [class.dark:text-amber-400]="notification.type === 'warning'"
                    [class.text-red-600]="notification.type === 'alert'"
                    [class.dark:text-red-400]="notification.type === 'alert'"
                    [class.text-green-600]="notification.type === 'success'"
                    [class.dark:text-green-400]="notification.type === 'success'"
                    [class.text-blue-600]="notification.type === 'info'"
                    [class.dark:text-blue-400]="notification.type === 'info'">
                {{ notification.icon }}
              </span>
              <div class="flex-1">
                <p class="font-semibold"
                   [class.text-amber-900]="notification.type === 'warning'"
                   [class.dark:text-amber-100]="notification.type === 'warning'"
                   [class.text-red-900]="notification.type === 'alert'"
                   [class.dark:text-red-100]="notification.type === 'alert'"
                   [class.text-green-900]="notification.type === 'success'"
                   [class.dark:text-green-100]="notification.type === 'success'"
                   [class.text-blue-900]="notification.type === 'info'"
                   [class.dark:text-blue-100]="notification.type === 'info'">
                  {{ notification.title }}
                </p>
                <p class="text-sm mt-1"
                   [class.text-amber-800]="notification.type === 'warning'"
                   [class.dark:text-amber-200]="notification.type === 'warning'"
                   [class.text-red-800]="notification.type === 'alert'"
                   [class.dark:text-red-200]="notification.type === 'alert'"
                   [class.text-green-800]="notification.type === 'success'"
                   [class.dark:text-green-200]="notification.type === 'success'"
                   [class.text-blue-800]="notification.type === 'info'"
                   [class.dark:text-blue-200]="notification.type === 'info'">
                  {{ notification.message }}
                </p>
              </div>
            </div>
          </div>

          <!-- Navigation Cards and Statistics -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Planning Column -->
            <div class="space-y-6">
              <!-- Planning Card -->
              <div
                (click)="navigateToPlanning()"
                class="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 p-8"
              >
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
                  </div>
                  <div class="flex items-center text-primary-600 dark:text-primary-400 font-medium">
                    <span>Accéder</span>
                    <span class="material-icons ml-2 group-hover:translate-x-2 transition-transform duration-300">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>

              <!-- Events Next 7 Days -->
              <div class="card p-6" *ngIf="eventsNext7Days.length > 0">
                <div class="flex items-center space-x-2 mb-3">
                  <span class="material-icons text-primary-600 dark:text-primary-400">calendar_today</span>
                  <h2 class="text-sm font-semibold text-gray-600 dark:text-gray-400">Événements des 7 prochains jours</h2>
                </div>
                <div class="space-y-2">
                  <div *ngFor="let event of eventsNext7Days"
                       class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                       (click)="navigateToPlanning()">
                    <div class="w-1.5 h-1.5 rounded-full" [style.background-color]="event.color"></div>
                    <span class="material-icons text-base" [style.color]="event.color">{{ event.icon }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ event.title }}</p>
                      <p class="text-xs text-gray-600 dark:text-gray-400">{{ formatDate(event.date) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Releases Column -->
            <div class="space-y-6">
              <!-- Releases Card -->
              <div
                (click)="navigateToReleases()"
                class="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 p-8"
              >
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
                  </div>
                  <div class="flex items-center text-primary-600 dark:text-primary-400 font-medium">
                    <span>Accéder</span>
                    <span class="material-icons ml-2 group-hover:translate-x-2 transition-transform duration-300">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>

              <!-- Next MEP -->
              <div class="card p-6">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Prochaine MEP</p>
                    <p class="text-xl font-bold text-gray-900 dark:text-white mb-1" *ngIf="nextMep">
                      {{ nextMep.name }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-300" *ngIf="nextMep">
                      {{ formatDate(nextMep.releaseDate) }}
                      <span class="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                            [class.bg-amber-100]="getDaysUntilMep(nextMep.releaseDate) <= 7 && getDaysUntilMep(nextMep.releaseDate) > 0"
                            [class.text-amber-800]="getDaysUntilMep(nextMep.releaseDate) <= 7 && getDaysUntilMep(nextMep.releaseDate) > 0"
                            [class.dark:bg-amber-900]="getDaysUntilMep(nextMep.releaseDate) <= 7 && getDaysUntilMep(nextMep.releaseDate) > 0"
                            [class.dark:text-amber-200]="getDaysUntilMep(nextMep.releaseDate) <= 7 && getDaysUntilMep(nextMep.releaseDate) > 0"
                            [class.bg-primary-100]="getDaysUntilMep(nextMep.releaseDate) > 7"
                            [class.text-primary-800]="getDaysUntilMep(nextMep.releaseDate) > 7"
                            [class.dark:bg-primary-900]="getDaysUntilMep(nextMep.releaseDate) > 7"
                            [class.dark:text-primary-200]="getDaysUntilMep(nextMep.releaseDate) > 7">
                        J-{{ getDaysUntilMep(nextMep.releaseDate) }}
                      </span>
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 italic" *ngIf="!nextMep">
                      Aucune MEP planifiée
                    </p>
                  </div>
                  <div class="w-12 h-12 rounded-full bg-releases-100 dark:bg-releases-900 flex items-center justify-center">
                    <span class="material-icons text-releases-600 dark:text-releases-400">rocket_launch</span>
                  </div>
                </div>
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
  nextMep: Release | null = null;
  eventsNext7Days: Event[] = [];
  notifications: Array<{ type: string; icon: string; title: string; message: string }> = [];

  constructor(
    private router: Router,
    public settingsService: SettingsService,
    private eventService: EventService,
    private releaseService: ReleaseService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    // Load events
    this.eventService.events$.subscribe(events => {
      // Events in the next 7 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      this.eventsNext7Days = events
        .filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today && eventDate <= sevenDaysFromNow;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
    });

    // Load releases
    this.releaseService.releases$.subscribe(releases => {
      // Find next MEP (future releases only, sorted by date)
      const futureReleases = releases
        .filter(r => isFuture(new Date(r.releaseDate)))
        .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());

      this.nextMep = futureReleases.length > 0 ? futureReleases[0] : null;

      // Generate notifications
      this.generateNotifications(releases);
    });
  }

  private generateNotifications(releases: Release[]): void {
    this.notifications = [];

    releases.forEach(release => {
      const daysUntil = this.getDaysUntilMep(release.releaseDate);

      // MEP imminente (dans moins de 7 jours)
      if (daysUntil >= 0 && daysUntil <= 7) {
        const completedSquads = release.squads.filter(squad => squad.isCompleted).length;
        const totalSquads = release.squads.length;
        const progressPercentage = totalSquads > 0 ? Math.round((completedSquads / totalSquads) * 100) : 0;

        // Déterminer le type de notification selon l'avancement
        let type = 'warning';
        let icon = 'schedule';
        let statusMessage = '';

        if (progressPercentage === 100) {
          type = 'success';
          icon = 'check_circle';
          statusMessage = ' - Toutes les squads sont prêtes ✓';
        } else if (progressPercentage >= 80) {
          type = 'info';
          icon = 'schedule';
          statusMessage = ` - ${progressPercentage}% complété (${completedSquads}/${totalSquads} squads)`;
        } else {
          type = 'warning';
          icon = 'warning';
          statusMessage = ` - Attention: ${progressPercentage}% complété (${completedSquads}/${totalSquads} squads)`;
        }

        this.notifications.push({
          type,
          icon,
          title: 'MEP Imminente',
          message: `La release "${release.name}" est prévue dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''} (${this.formatDate(release.releaseDate)})${statusMessage}`
        });
      }
    });
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  }

  getDaysUntilMep(dateString: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mepDate = new Date(dateString);
    mepDate.setHours(0, 0, 0, 0);
    return differenceInDays(mepDate, today);
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
