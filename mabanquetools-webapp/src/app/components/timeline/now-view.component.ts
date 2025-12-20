import { Component, Input, Output, EventEmitter, OnChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Event, CATEGORY_COLORS_DARK } from '@models/event.model';
import { SettingsService } from '@services/settings.service';
import { TimelineService } from '@services/timeline.service';
import { CategoryService } from '@services/category.service';
import { ConfirmationService } from '@services/confirmation.service';
import { format, addDays, subDays, isToday, isPast, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SprintService } from '@services/sprint.service';
import { Sprint } from '@models/sprint.model';

interface DayCard {
  date: Date;
  dateStr: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  weekNumber: number;
  events: Event[];
  activeSprint?: Sprint;
  sprintIndex?: number;
  isSprintStart?: boolean;
}

@Component({
  selector: 'app-now-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="now-view-container">
      <!-- Timeline horizontale avec scroll infini -->
      <div class="relative">
        <!-- Scroll container -->
        <div
          class="overflow-x-auto pb-6 custom-scrollbar"
          #scrollContainer
          (scroll)="onScroll($event)"
        >
          <div class="flex space-x-3 min-w-max px-4">
            <div
              *ngFor="let day of days; let i = index"
              [attr.data-is-today]="day.isToday"
              class="day-card-container transition-all duration-300"
              [style.width.px]="180"
            >
              <!-- Carte du jour -->
              <div
                [class.card-today]="day.isToday"
                [class.card-past]="day.isPast"
                [class.card-future]="day.isFuture"
                [class.card-weekend]="day.isWeekend && !day.isToday"
                [class.card-holiday]="day.isHoliday && !day.isToday"
                class="day-card h-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2"
                [class.border-amber-400]="day.isToday"
                [class.border-gray-300]="!day.isToday && !day.isWeekend && !day.isHoliday"
                [class.border-gray-400]="!day.isToday && (day.isWeekend || day.isHoliday)"
                [class.dark:border-amber-500]="day.isToday"
                [class.dark:border-gray-600]="!day.isToday && !day.isWeekend && !day.isHoliday"
                [class.dark:border-gray-500]="!day.isToday && (day.isWeekend || day.isHoliday)"
                [class.dark:border-gray-500]="!day.isToday && (day.isWeekend || day.isHoliday)"
              >
                <!-- Sprint Marker (Option A) -->

                <!-- Header de la carte -->
                <div
                  [class.bg-gradient-to-br]="true"
                  [class.from-amber-400]="day.isToday"
                  [class.to-amber-600]="day.isToday"
                  [class.from-red-400]="day.isHoliday && !day.isToday"
                  [class.to-red-500]="day.isHoliday && !day.isToday"
                  [class.from-slate-400]="day.isWeekend && !day.isHoliday && !day.isToday"
                  [class.to-slate-500]="day.isWeekend && !day.isHoliday && !day.isToday"
                  [class.from-gray-300]="day.isPast && !day.isToday && !day.isWeekend && !day.isHoliday"
                  [class.to-gray-400]="day.isPast && !day.isToday && !day.isWeekend && !day.isHoliday"
                  [class.from-primary-400]="day.isFuture && !day.isToday && !day.isWeekend && !day.isHoliday"
                  [class.to-primary-600]="day.isFuture && !day.isToday && !day.isWeekend && !day.isHoliday"
                  class="px-3 py-2 text-white relative overflow-hidden"
                >
                  <div class="absolute inset-0 bg-black/10"></div>
                  <div class="relative z-10">
                    <div class="text-[10px] uppercase tracking-wider opacity-90 font-semibold">
                      {{ day.dayName }}
                    </div>
                    <div class="flex items-baseline space-x-1.5">
                      <div class="text-3xl font-bold">{{ day.dayNumber }}</div>
                      <div class="text-sm opacity-90">{{ day.monthName }}</div>
                    </div>
                    <div
                      *ngIf="day.isToday"
                      class="mt-0.5 flex items-center space-x-1 text-[10px] font-bold"
                    >
                      <span class="material-icons text-xs animate-pulse">fiber_manual_record</span>
                      <span>EN DIRECT</span>
                    </div>
                    <div
                      *ngIf="!day.isToday"
                      class="mt-0.5 text-[10px] opacity-90"
                    >
                      Semaine {{ day.weekNumber }}<span *ngIf="day.activeSprint"> - {{ day.activeSprint.name }}</span>
                    </div>

                  </div>

                  <!-- Déco géométrique -->
                  <div class="absolute -right-3 -bottom-3 w-16 h-16 bg-white/10 rounded-full"></div>
                </div>

                <!-- Corps de la carte - Événements -->
                <div class="p-4 bg-white dark:bg-gray-800 h-[400px] overflow-y-auto custom-scrollbar">
                  <div *ngIf="day.events.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <span class="material-icons text-5xl mb-2 opacity-30">event_available</span>
                    <p class="text-sm">Aucun événement</p>
                    <button
                      (click)="onAddEvent(day.dateStr)"
                      class="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <span class="material-icons text-sm">add</span>
                      <span>Ajouter</span>
                    </button>
                  </div>

                  <div *ngIf="day.events.length > 0" class="space-y-2">
                    <div
                      *ngFor="let event of day.events"
                      class="group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1.5 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4"
                      [style.border-left-color]="getEventColor(event)"
                      (click)="onEventClick(event)"
                    >
                      <div class="flex items-start gap-1">
                        <div
                          class="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center mt-0.5"
                          [style.background-color]="getEventColor(event) + '20'"
                        >
                          <span
                            class="material-icons"
                            style="font-size: 12px;"
                            [style.color]="getEventColor(event)"
                          >
                            {{ event.icon }}
                          </span>
                        </div>
                        <div class="flex-1 min-w-0 pr-1">
                          <h4 class="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                            {{ event.title }}
                          </h4>
                          <div *ngIf="event.startTime" class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {{ event.startTime }}
                          </div>
                        </div>
                        <button
                          (click)="onDeleteEvent($event, event)"
                          class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/30 rounded p-0.5"
                          title="Supprimer"
                        >
                          <span class="material-icons text-red-600 dark:text-red-400" style="font-size: 14px;">delete</span>
                        </button>
                      </div>
                    </div>

                    <!-- Bouton ajouter en bas -->
                    <button
                      (click)="onAddEvent(day.dateStr)"
                      class="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors text-sm font-medium flex items-center justify-center"
                      title="Ajouter un événement"
                    >
                      <span class="material-icons text-lg">add</span>
                    </button>
                  </div>
                </div>

                <!-- Footer avec stats -->
                <div class="px-4 py-3 bg-gray-100 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-600">
                  <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span class="flex items-center space-x-1">
                      <span class="material-icons" style="font-size: 14px;">event</span>
                      <span>{{ day.events.length }} événement{{ day.events.length !== 1 ? 's' : '' }}</span>
                    </span>
                    <span *ngIf="day.isHoliday" class="flex items-center space-x-1 text-red-500 dark:text-red-400">
                      <span class="material-icons" style="font-size: 14px;">celebration</span>
                      <span>Férié</span>
                    </span>
                    <span *ngIf="day.isWeekend && !day.isHoliday" class="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <span class="material-icons" style="font-size: 14px;">weekend</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .now-view-container {
      min-height: 600px;
    }

    .day-card-container {
      flex-shrink: 0;
    }

    .day-card {
      display: flex;
      flex-direction: column;
    }

    .card-today {
      animation: pulse-border 2s ease-in-out infinite;
    }

    @keyframes pulse-border {
      0%, 100% {
        box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
      }
      50% {
        box-shadow: 0 0 40px rgba(251, 191, 36, 0.6);
      }
    }

    .card-past {
      opacity: 0.85;
    }

    .card-future {
      opacity: 0.95;
    }

    .card-weekend {
      background-color: rgba(156, 163, 175, 0.05);
    }

    :host-context(.dark) .card-weekend {
      background-color: rgba(156, 163, 175, 0.1);
    }

    .card-holiday {
      background-color: rgba(239, 68, 68, 0.05);
    }

    :host-context(.dark) .card-holiday {
      background-color: rgba(239, 68, 68, 0.1);
    }

    .custom-scrollbar::-webkit-scrollbar {
      height: 8px;
      width: 8px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(16, 185, 129, 0.3);
      border-radius: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(16, 185, 129, 0.5);
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class NowViewComponent implements OnChanges, AfterViewInit {
  @Input() events: Event[] | null = [];
  @Output() eventClick = new EventEmitter<Event>();
  @Output() addEventClick = new EventEmitter<string>();
  @Output() deleteEventClick = new EventEmitter<Event>();
  @ViewChild('scrollContainer') scrollContainer?: ElementRef;

  days: DayCard[] = [];
  sprints: Sprint[] = [];
  isDark = false;

  // Gestion du scroll infini avec fenêtre glissante
  private readonly INITIAL_DAYS_BEFORE = 0; // Jours avant aujourd'hui au chargement (aujourd'hui est le premier)
  private readonly INITIAL_DAYS_AFTER = 30; // Jours après aujourd'hui au chargement
  private readonly LOAD_MORE_THRESHOLD = 500; // px avant le bord pour charger plus
  private readonly MAX_DAYS_IN_MEMORY = 90; // Maximum de jours gardés en mémoire
  private readonly DAYS_TO_LOAD = 15; // Nombre de jours à charger à chaque fois
  private startDate: Date = new Date(); // Date de début de la fenêtre
  private endDate: Date = new Date(); // Date de fin de la fenêtre
  private isLoadingMore = false;
  private isFirstLoad = true; // Flag pour le premier chargement
  private shouldPreserveScroll = false; // Flag pour préserver le scroll

  constructor(
    private settingsService: SettingsService,
    private timelineService: TimelineService,
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private sprintService: SprintService
  ) {
    this.settingsService.preferences$
      .pipe(takeUntilDestroyed())
      .subscribe(prefs => {
        this.isDark = prefs.theme === 'dark';
      });

    // Écouter le signal "Aujourd'hui" du service timeline
    this.timelineService.scrollToToday$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.scrollToTodayStart();
      });



    this.loadSprints();
  }

  private loadSprints() {
    this.sprintService.getAllSprints().subscribe(sprints => {
      // Sort sprints
      this.sprints = sprints.sort((a, b) => a.startDate.localeCompare(b.startDate));
      // Re-initialize days to apply sprint info
      this.initializeDays();
    });
  }

  ngOnChanges(): void {
    // Si ce n'est pas le premier chargement, préserver le scroll
    if (!this.isFirstLoad) {
      this.shouldPreserveScroll = true;
      const savedScrollLeft = this.scrollContainer?.nativeElement?.scrollLeft || 0;

      this.reloadDaysOnly();

      // Restaurer la position de scroll après le rechargement
      setTimeout(() => {
        if (this.scrollContainer && savedScrollLeft > 0) {
          this.scrollContainer.nativeElement.scrollLeft = savedScrollLeft;
        }
        this.shouldPreserveScroll = false;
      }, 0);
    }
  }

  ngAfterViewInit(): void {
    // Premier chargement : scroll à 0 (aujourd'hui est déjà le premier)
    if (this.isFirstLoad && this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollLeft = 0;
      this.isFirstLoad = false;
    }
  }

  private initializeDays(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Définir la fenêtre initiale : quelques jours avant + beaucoup après
    this.startDate = subDays(today, this.INITIAL_DAYS_BEFORE);
    this.endDate = addDays(today, this.INITIAL_DAYS_AFTER);

    this.loadDaysInRange(this.startDate, this.endDate);
  }

  private loadDaysInRange(start: Date, end: Date): void {
    const allDays: DayCard[] = [];
    let current = new Date(start);

    while (current <= end) {
      allDays.push(this.createDayCard(new Date(current)));
      current = addDays(current, 1);
    }

    this.days = allDays;
  }

  private reloadDaysOnly(): void {
    // Recharger uniquement les événements pour les jours existants
    // sans changer les dates ni la structure
    this.days = this.days.map(day => ({
      ...day,
      events: this.getEventsForDay(day.dateStr)
    }));
  }

  onScroll(event: any): void {
    if (this.isLoadingMore || !this.scrollContainer) return;

    const container = this.scrollContainer.nativeElement;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    // Charger plus à gauche (dates passées)
    if (scrollLeft < this.LOAD_MORE_THRESHOLD) {
      this.loadMorePast();
    }

    // Charger plus à droite (dates futures)
    if (scrollLeft + clientWidth > scrollWidth - this.LOAD_MORE_THRESHOLD) {
      this.loadMoreFuture();
    }
  }

  private loadMorePast(): void {
    this.isLoadingMore = true;

    // Ajouter des jours dans le passé
    const newStartDate = subDays(this.startDate, this.DAYS_TO_LOAD);
    const newDays: DayCard[] = [];

    let current = new Date(newStartDate);
    while (current < this.startDate) {
      newDays.push(this.createDayCard(new Date(current)));
      current = addDays(current, 1);
    }

    // Ajouter au début
    this.days = [...newDays, ...this.days];
    this.startDate = newStartDate;

    // Nettoyer la mémoire si nécessaire
    this.trimMemory();

    // Ajuster le scroll pour compenser l'ajout
    if (this.scrollContainer) {
      const cardWidth = 180 + 12; // width + gap
      const addedWidth = newDays.length * cardWidth;
      this.scrollContainer.nativeElement.scrollLeft += addedWidth;
    }

    setTimeout(() => {
      this.isLoadingMore = false;
    }, 100);
  }

  private loadMoreFuture(): void {
    this.isLoadingMore = true;

    // Ajouter des jours dans le futur
    const newEndDate = addDays(this.endDate, this.DAYS_TO_LOAD);
    const newDays: DayCard[] = [];

    let current = addDays(this.endDate, 1);
    while (current <= newEndDate) {
      newDays.push(this.createDayCard(new Date(current)));
      current = addDays(current, 1);
    }

    // Ajouter à la fin
    this.days = [...this.days, ...newDays];
    this.endDate = newEndDate;

    // Nettoyer la mémoire si nécessaire
    this.trimMemory();

    setTimeout(() => {
      this.isLoadingMore = false;
    }, 100);
  }

  private trimMemory(): void {
    // Si on dépasse le nombre maximum de jours en mémoire, supprimer les extrémités
    if (this.days.length > this.MAX_DAYS_IN_MEMORY) {
      const excess = this.days.length - this.MAX_DAYS_IN_MEMORY;
      const halfExcess = Math.floor(excess / 2);

      // Supprimer du début et de la fin
      this.days = this.days.slice(halfExcess, this.days.length - (excess - halfExcess));

      // Mettre à jour les dates de début et fin
      if (this.days.length > 0) {
        this.startDate = this.days[0].date;
        this.endDate = this.days[this.days.length - 1].date;
      }
    }
  }

  private createDayCard(date: Date): DayCard {
    const dateStr = format(date, 'yyyy-MM-dd');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    return {
      date,
      dateStr,
      dayName: format(date, 'EEEE', { locale: fr }).toUpperCase(),
      dayNumber: date.getDate(),
      monthName: format(date, 'MMM', { locale: fr }).toUpperCase(),
      isToday: isToday(date),
      isPast: compareDate < today,
      isFuture: compareDate > today,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isHoliday: this.isHoliday(date),
      weekNumber: this.getWeekNumber(date),

      events: this.getEventsForDay(dateStr),
      ...this.getSprintInfo(dateStr)
    };
  }

  private getSprintInfo(dateStr: string): { activeSprint?: Sprint, sprintIndex?: number, isSprintStart?: boolean } {
    if (!this.sprints.length) return {};

    const index = this.sprints.findIndex(s => dateStr >= s.startDate && dateStr <= s.endDate);
    if (index === -1) return {};

    const sprint = this.sprints[index];
    return {
      activeSprint: sprint,
      sprintIndex: index,
      isSprintStart: sprint.startDate === dateStr
    };
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  isHoliday(day: Date): boolean {
    const year = day.getFullYear();
    const month = day.getMonth() + 1; // 0-indexed
    const date = day.getDate();

    // Fixed holidays
    const fixedHolidays = [
      { month: 1, date: 1 },   // Jour de l'an
      { month: 5, date: 1 },   // Fête du travail
      { month: 5, date: 8 },   // Victoire 1945
      { month: 7, date: 14 },  // Fête nationale
      { month: 8, date: 15 },  // Assomption
      { month: 11, date: 1 },  // Toussaint
      { month: 11, date: 11 }, // Armistice 1918
      { month: 12, date: 25 }  // Noël
    ];

    // Check fixed holidays
    if (fixedHolidays.some(h => h.month === month && h.date === date)) {
      return true;
    }

    // Easter-based holidays (Pâques, Lundi de Pâques, Ascension, Pentecôte)
    const easter = this.getEasterDate(year);
    const easterMonday = new Date(easter);
    easterMonday.setDate(easter.getDate() + 1);
    const ascension = new Date(easter);
    ascension.setDate(easter.getDate() + 39);
    const pentecostMonday = new Date(easter);
    pentecostMonday.setDate(easter.getDate() + 50);

    const easterHolidays = [easter, easterMonday, ascension, pentecostMonday];
    return easterHolidays.some(holiday =>
      holiday.getFullYear() === year &&
      holiday.getMonth() === day.getMonth() &&
      holiday.getDate() === date
    );
  }

  // Calculate Easter date using Computus algorithm
  private getEasterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  private getEventsForDay(dateStr: string): Event[] {
    if (!this.events) return [];
    return this.events.filter(event => {
      if (event.endDate) {
        return dateStr >= event.date && dateStr <= event.endDate;
      }
      return event.date === dateStr;
    });
  }

  getCategoryLabel(categoryId: string): string {
    return this.categoryService.getCategoryLabel(categoryId);
  }

  getEventColor(event: Event): string {
    if (this.isDark) {
      return CATEGORY_COLORS_DARK[event.category] || event.color;
    }
    return event.color;
  }

  onEventClick(event: Event): void {
    this.eventClick.emit(event);
  }

  onAddEvent(dateStr: string): void {
    this.addEventClick.emit(dateStr);
  }

  async onDeleteEvent(mouseEvent: MouseEvent, event: Event): Promise<void> {
    mouseEvent.stopPropagation();
    const confirmed = await this.confirmationService.confirm({
      title: 'Supprimer cet événement ?',
      message: `Voulez-vous vraiment supprimer l'événement "${event.title}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmButtonClass: 'danger'
    });
    if (confirmed) {
      this.deleteEventClick.emit(event);
    }
  }

  scrollToToday(): void {
    // Méthode pour centrer aujourd'hui (utilisée par la vue trimestrielle)
    const todayCardContainer = document.querySelector('[data-is-today="true"]') as HTMLElement;
    if (todayCardContainer && this.scrollContainer) {
      const container = this.scrollContainer.nativeElement;
      const cardRect = todayCardContainer.getBoundingClientRect();

      // Calculer la position de scroll pour centrer la carte aujourd'hui
      const scrollLeft = todayCardContainer.offsetLeft - (container.clientWidth / 2) + (cardRect.width / 2);

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }

  scrollToTodayStart(): void {
    // Réinitialiser complètement la vue
    this.isLoadingMore = true;
    this.isFirstLoad = true;

    // Réinitialiser les jours pour que aujourd'hui soit en premier
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.startDate = subDays(today, this.INITIAL_DAYS_BEFORE);
    this.endDate = addDays(today, this.INITIAL_DAYS_AFTER);
    this.loadDaysInRange(this.startDate, this.endDate);

    // Attendre que le DOM soit mis à jour puis forcer le scroll à 0
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollLeft = 0;
      }
      this.isLoadingMore = false;
      this.isFirstLoad = false;
    }, 0);
  }

  scrollToPast(): void {
    const firstCard = document.querySelector('.day-card-container');
    if (firstCard) {
      firstCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
    }
  }

  scrollToFuture(): void {
    const lastCard = document.querySelector('.day-card-container:last-child');
    if (lastCard) {
      lastCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'end' });
    }
  }
}
