import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SettingsService } from '@services/settings.service';
import { EventService } from '@services/event.service';
import { ReleaseService } from '@services/release.service';
import { AuthService } from '@services/auth.service';
import { Event } from '@models/event.model';
import { Release } from '@models/release.model';
import { format, isThisWeek, isFuture, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProgressRingComponent } from '../shared/progress-ring.component';
import { interval, Subscription } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

interface Widget {
  id: string;
  type: 'events7days' | 'nextMep';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProgressRingComponent, DragDropModule],
  template: `
    <div class="space-y-8">
          <!-- Applications Section -->
          <section class="space-y-6">
            <div class="text-center mb-6">
              <div class="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100/60 dark:bg-primary-900/30 backdrop-blur-md border border-primary-200/50 dark:border-primary-700/50 rounded-full shadow-sm">
                <span class="material-icons text-primary-600 dark:text-primary-400 text-sm">apps</span>
                <span class="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Applications</span>
              </div>
            </div>

            <!-- Navigation Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Calendrier Card -->
              <div
                (click)="navigateToCalendar()"
                class="group cursor-pointer bg-white dark:bg-gray-750 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] p-8 overflow-hidden relative"
              >
                <!-- Effet de brillance au hover -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                <div class="flex flex-col items-center text-center space-y-6 relative z-10">
                  <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <span class="material-icons text-white" style="font-size: 48px;">
                      calendar_month
                    </span>
                  </div>
                  <div>
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      Calendrier
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

              <!-- Préparation des MEP Card -->
              <div
                (click)="navigateToReleases()"
                class="group cursor-pointer bg-white dark:bg-gray-750 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] p-8 overflow-hidden relative"
              >
                <!-- Effet de brillance au hover -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                <div class="flex flex-col items-center text-center space-y-6 relative z-10">
                  <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <span class="material-icons text-white" style="font-size: 48px;">
                      rocket_launch
                    </span>
                  </div>
                  <div>
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      Préparation des MEP
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
            </div>
          </section>

          <!-- Decorative Separator -->
          <div class="relative py-4">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t-2 border-gray-200 dark:border-gray-600"></div>
            </div>
            <div class="relative flex justify-center">
              <div class="bg-gray-100 dark:bg-gray-800 px-6 py-2 rounded-full">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
                  <div class="w-2 h-2 rounded-full bg-primary-500 animate-pulse" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 rounded-full bg-primary-600 animate-pulse" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Widgets Section -->
          <section class="space-y-6">
            <div class="text-center -mt-4 mb-4">
              <div class="inline-flex items-center space-x-2 px-4 py-2 bg-orange-100/60 dark:bg-orange-900/30 backdrop-blur-md border border-orange-200/50 dark:border-orange-700/50 rounded-full shadow-sm">
                <span class="material-icons text-orange-600 dark:text-orange-400 text-sm">dashboard</span>
                <span class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Widgets</span>
              </div>
            </div>

            <!-- Widgets Grid avec Drag & Drop -->
            <div
              cdkDropList
              [cdkDropListAutoScrollDisabled]="false"
              (cdkDropListDropped)="onWidgetDrop($event)"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

              <!-- Iterate through ordered widgets -->
              <ng-container *ngFor="let widget of orderedWidgets">
                <div cdkDrag class="relative group">
                  <!-- Drag indicator (visible on hover) -->
                  <div class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none p-1 bg-primary-500/90 dark:bg-primary-600/90 rounded shadow-lg">
                    <span class="material-icons text-xs text-white">open_with</span>
                  </div>

                  <!-- Events Next 7 Days Widget -->
                  <div *ngIf="widget.type === 'events7days' && eventsNext7Days.length > 0"
                       class="widget-card bg-white dark:bg-gray-750 rounded-2xl shadow-md p-4 border-2 border-gray-200 dark:border-gray-600 hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 aspect-[4/3] flex flex-col cursor-move"
                       (click)="handleWidgetClick($event, 'calendar')">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <span class="material-icons text-sm text-blue-600 dark:text-blue-400">calendar_today</span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <h2 class="text-sm font-bold text-gray-900 dark:text-white truncate">Événements</h2>
                          <p class="text-xs text-gray-600 dark:text-gray-400">7 jours</p>
                        </div>
                      </div>
                      <div class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {{ eventsNext7Days.length }}
                      </div>
                    </div>
                    <div class="space-y-1 flex-1 overflow-y-auto custom-scrollbar-thin">
                      <div *ngFor="let event of eventsNext7Days.slice(0, 3)"
                           class="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                           (click)="navigateToEvent(event, $event)">
                        <div class="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" [style.background-color]="event.color"></div>
                        <span class="material-icons text-xs flex-shrink-0" [style.color]="event.color">{{ event.icon }}</span>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ event.title }}</p>
                        </div>
                      </div>
                      <div *ngIf="eventsNext7Days.length > 3"
                           class="text-xs text-center text-gray-500 dark:text-gray-400 pt-1">
                        +{{ eventsNext7Days.length - 3 }} autres
                      </div>
                    </div>
                  </div>

                  <!-- Empty state Events -->
                  <div *ngIf="widget.type === 'events7days' && eventsNext7Days.length === 0"
                       class="widget-card bg-white dark:bg-gray-750 rounded-2xl shadow-md p-4 border-2 border-gray-200 dark:border-gray-600 hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 aspect-[4/3] flex flex-col items-center justify-center cursor-move">
                    <span class="material-icons text-3xl text-gray-400 dark:text-gray-600 mb-2">event_available</span>
                    <p class="text-xs text-gray-600 dark:text-gray-400 text-center">Aucun événement</p>
                    <p class="text-xs text-gray-500 dark:text-gray-500 text-center">7 prochains jours</p>
                  </div>

                  <!-- Next MEP Widget -->
                  <div *ngIf="widget.type === 'nextMep'"
                       class="widget-card bg-white dark:bg-gray-750 rounded-2xl shadow-md p-4 border-2 border-gray-200 dark:border-gray-600 hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 aspect-[4/3] flex flex-col cursor-move"
                       (click)="handleWidgetClick($event, nextMep ? 'release' : null, nextMep)">
                    <div *ngIf="nextMep" class="flex flex-col h-full">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2 flex-1 min-w-0">
                          <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span class="material-icons text-sm text-emerald-600 dark:text-emerald-400">rocket_launch</span>
                          </div>
                          <div class="flex-1 min-w-0">
                            <h2 class="text-sm font-bold text-gray-900 dark:text-white truncate">MEP</h2>
                          </div>
                        </div>
                        <span class="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                              [class.bg-amber-100]="getDaysUntilMep(nextMep.releaseDate) <= 7 && getDaysUntilMep(nextMep.releaseDate) > 0"
                              [class.text-amber-800]="getDaysUntilMep(nextMep.releaseDate) <= 7 && getDaysUntilMep(nextMep.releaseDate) > 0"
                              [class.dark:bg-amber-900]="getDaysUntilMep(nextMep.releaseDate) <= 7 && getDaysUntilMep(nextMep.releaseDate) > 0"
                              [class.dark:text-amber-200]="getDaysUntilMep(nextMep.releaseDate) <= 7 && getDaysUntilMep(nextMep.releaseDate) > 0"
                              [class.bg-emerald-100]="getDaysUntilMep(nextMep.releaseDate) > 7"
                              [class.text-emerald-800]="getDaysUntilMep(nextMep.releaseDate) > 7"
                              [class.dark:bg-emerald-900]="getDaysUntilMep(nextMep.releaseDate) > 7"
                              [class.dark:text-emerald-200]="getDaysUntilMep(nextMep.releaseDate) > 7">
                          J-{{ getDaysUntilMep(nextMep.releaseDate) }}
                        </span>
                      </div>

                      <div class="flex-1 flex flex-col items-center justify-center min-h-0">
                        <app-progress-ring
                          [percentage]="getNextMepProgress()"
                          [size]="56"
                          [strokeWidth]="5"
                          [color]="getNextMepProgress() === 100 ? 'success' : 'warning'"
                        ></app-progress-ring>
                        <p class="text-xs font-semibold text-gray-900 dark:text-white mt-2 text-center truncate w-full px-1">
                          {{ nextMep.name }}
                        </p>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {{ getCompletedSquadsCount() }}/{{ getTotalSquadsCount() }} squads
                        </p>
                      </div>
                    </div>

                    <!-- Empty state -->
                    <div class="flex flex-col items-center justify-center h-full" *ngIf="!nextMep">
                      <span class="material-icons text-3xl text-gray-400 dark:text-gray-600 mb-2">rocket</span>
                      <p class="text-xs text-gray-600 dark:text-gray-400 text-center">Aucune MEP planifiée</p>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>
          </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    /* Widget cards styles */
    .widget-card {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      cursor: move;
    }

    /* Preview du widget pendant le drag */
    .cdk-drag-preview .widget-card {
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
      opacity: 0.9;
      border: 2px solid #10b981 !important;
    }

    /* Placeholder - zone où le widget sera déposé */
    .cdk-drag-placeholder {
      opacity: 0;
    }

    /* Animation fluide pendant le drag */
    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    /* Cursor pendant le drag */
    .cdk-drag-dragging {
      cursor: grabbing !important;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  nextMep: Release | null = null;
  eventsNext7Days: Event[] = [];
  orderedWidgets: Widget[] = [];

  // Stats pour compteurs animés
  totalEvents = 0;
  activeReleases = 0;
  completionRate = 0;
  hotfixCount = 0;

  // Valeurs animées
  animatedEventsCount = 0;
  animatedReleasesCount = 0;
  animatedCompletionRate = 0;
  animatedHotfixCount = 0;

  private animationSubscription?: Subscription;

  // Default widget order
  private readonly DEFAULT_WIDGETS: Widget[] = [
    { id: 'events7days', type: 'events7days' },
    { id: 'nextMep', type: 'nextMep' }
  ];

  constructor(
    private router: Router,
    public settingsService: SettingsService,
    private eventService: EventService,
    private releaseService: ReleaseService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadWidgetOrder();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    if (this.animationSubscription) {
      this.animationSubscription.unsubscribe();
    }
  }

  /**
   * Charge l'ordre des widgets depuis les préférences utilisateur
   */
  private loadWidgetOrder(): void {
    const savedOrder = this.authService.getWidgetOrder();

    if (savedOrder.length > 0) {
      // Reconstruct widgets based on saved order
      this.orderedWidgets = savedOrder
        .map(id => this.DEFAULT_WIDGETS.find(w => w.id === id))
        .filter((w): w is Widget => w !== undefined);

      // Add any new widgets that aren't in saved order
      const missingWidgets = this.DEFAULT_WIDGETS.filter(
        w => !savedOrder.includes(w.id)
      );
      this.orderedWidgets.push(...missingWidgets);
    } else {
      // Use default order
      this.orderedWidgets = [...this.DEFAULT_WIDGETS];
    }
  }

  /**
   * Handler pour le drop event du drag & drop
   */
  async onWidgetDrop(event: CdkDragDrop<Widget[]>): Promise<void> {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    // Réorganiser les widgets
    moveItemInArray(this.orderedWidgets, event.previousIndex, event.currentIndex);

    // Sauvegarder l'ordre
    const widgetIds = this.orderedWidgets.map(w => w.id);
    await this.authService.updateWidgetOrder(widgetIds);
  }

  /**
   * Gère les clics sur les widgets (uniquement si pas en train de drag)
   */
  handleWidgetClick(event: MouseEvent, type: string | null, release?: Release | null): void {
    // Vérifier si c'est un vrai clic (pas un drag)
    const target = event.target as HTMLElement;
    if (target.closest('.cdk-drag-preview') || target.closest('.cdk-drag-placeholder')) {
      return;
    }

    // Navigation selon le type
    if (type === 'calendar') {
      this.navigateToCalendar();
    } else if (type === 'release' && release) {
      this.navigateToRelease(release);
    }
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

      // Calculate total events this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      this.totalEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      }).length;

      this.animateCounter('events', this.totalEvents);
    });

    // Load releases
    this.releaseService.releases$.subscribe(releases => {
      // Find next MEP (future releases only, sorted by date)
      const futureReleases = releases
        .filter(r => isFuture(new Date(r.releaseDate)))
        .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());

      this.nextMep = futureReleases.length > 0 ? futureReleases[0] : null;

      // Calculate stats
      this.activeReleases = releases.filter(r =>
        r.status === 'in_progress' || isFuture(new Date(r.releaseDate))
      ).length;

      this.hotfixCount = releases.filter(r =>
        r.type === 'hotfix' && (r.status === 'in_progress' || isFuture(new Date(r.releaseDate)))
      ).length;

      // Calculate average completion rate
      const releasesWithSquads = releases.filter(r => r.squads.length > 0);
      if (releasesWithSquads.length > 0) {
        const totalCompletion = releasesWithSquads.reduce((sum, release) => {
          const completedSquads = release.squads.filter(s => s.isCompleted).length;
          const percentage = release.squads.length > 0
            ? (completedSquads / release.squads.length) * 100
            : 0;
          return sum + percentage;
        }, 0);
        this.completionRate = Math.round(totalCompletion / releasesWithSquads.length);
      } else {
        this.completionRate = 0;
      }

      // Animate counters
      this.animateCounter('releases', this.activeReleases);
      this.animateCounter('completion', this.completionRate);
      this.animateCounter('hotfix', this.hotfixCount);
    });
  }

  private animateCounter(type: 'events' | 'releases' | 'completion' | 'hotfix', target: number): void {
    const duration = 1000; // 1 seconde
    const steps = 30;
    const increment = target / steps;
    let current = 0;

    if (this.animationSubscription) {
      this.animationSubscription.unsubscribe();
    }

    this.animationSubscription = interval(duration / steps).subscribe(() => {
      current += increment;
      if (current >= target) {
        current = target;
        switch (type) {
          case 'events':
            this.animatedEventsCount = Math.round(current);
            break;
          case 'releases':
            this.animatedReleasesCount = Math.round(current);
            break;
          case 'completion':
            this.animatedCompletionRate = Math.round(current);
            break;
          case 'hotfix':
            this.animatedHotfixCount = Math.round(current);
            break;
        }
        this.animationSubscription?.unsubscribe();
      } else {
        switch (type) {
          case 'events':
            this.animatedEventsCount = Math.round(current);
            break;
          case 'releases':
            this.animatedReleasesCount = Math.round(current);
            break;
          case 'completion':
            this.animatedCompletionRate = Math.round(current);
            break;
          case 'hotfix':
            this.animatedHotfixCount = Math.round(current);
            break;
        }
      }
    });
  }

  getNextMepProgress(): number {
    if (!this.nextMep || this.nextMep.squads.length === 0) {
      return 0;
    }
    const completedSquads = this.nextMep.squads.filter(s => s.isCompleted).length;
    return Math.round((completedSquads / this.nextMep.squads.length) * 100);
  }

  getCompletedSquadsCount(): number {
    if (!this.nextMep) {
      return 0;
    }
    return this.nextMep.squads.filter(s => s.isCompleted).length;
  }

  getTotalSquadsCount(): number {
    if (!this.nextMep) {
      return 0;
    }
    return this.nextMep.squads.length;
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

  navigateToCalendar(): void {
    this.router.navigate(['/calendar']);
  }

  navigateToEvent(event: Event, mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation();
    this.router.navigate(['/calendar'], { queryParams: { eventId: event.id } });
  }

  navigateToReleases(): void {
    this.router.navigate(['/releases']);
  }

  navigateToRelease(release: Release): void {
    // Utiliser l'ID pour l'URL
    const routeParam = release.id;
    this.router.navigate(['/releases', routeParam]);
  }

  toggleTheme(): void {
    this.settingsService.toggleTheme();
  }
}
