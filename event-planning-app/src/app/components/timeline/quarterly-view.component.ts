import { Component, Input, Output, EventEmitter, OnChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Event, CATEGORY_COLORS_DARK } from '@models/event.model';
import { SettingsService } from '@services/settings.service';
import { TimelineService } from '@services/timeline.service';
import { CategoryService } from '@services/category.service';
import { ConfirmationService } from '@services/confirmation.service';
import { format, addMonths, subMonths, isToday, isPast, isFuture, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MonthCard {
  month: Date;
  monthName: string;
  year: number;
  days: DayCard[];
}

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
}

@Component({
  selector: 'app-quarterly-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quarterly-view-container">
      <!-- Scroll container vertical -->
      <div
        class="overflow-y-auto custom-scrollbar"
        #scrollContainer
        (scroll)="onScroll($event)"
        style="max-height: calc(100vh - 300px);"
      >
        <div class="space-y-8 pb-6">
          <div *ngFor="let monthCard of monthCards" class="month-section">
            <!-- En-tête du mois -->
            <div class="sticky top-0 z-10 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-t-xl shadow-md mb-4 relative overflow-hidden">
              <div class="absolute inset-0 bg-black/10"></div>
              <!-- Déco géométrique - Bulles multiples -->
              <div class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/15 rounded-full"></div>
              <div class="absolute right-16 top-1/2 -translate-y-1/2 w-5 h-5 bg-white/20 rounded-full"></div>
              <div class="absolute right-28 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/12 rounded-full"></div>
              <div class="absolute right-40 top-1/2 -translate-y-1/2 w-4 h-4 bg-white/18 rounded-full"></div>
              <h3 class="text-base font-bold relative z-10">
                {{ monthCard.monthName }} {{ monthCard.year }}
              </h3>
            </div>

            <!-- Grille des semaines -->
            <div class="space-y-3 px-2">
              <div *ngFor="let week of getWeeks(monthCard.days)" class="week-row">
                <!-- En-tête de semaine -->
                <div class="flex items-center mb-2 px-2">
                  <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Semaine {{ week[0].weekNumber }}
                  </span>
                </div>

                <!-- Jours de la semaine -->
                <div class="grid grid-cols-7 gap-2">
                  <div
                    *ngFor="let day of week"
                    class="day-card-mini"
                  >
                    <!-- Carte du jour -->
                    <div
                      [class.card-today]="day.isToday"
                      [class.card-past]="day.isPast && !day.isToday"
                      [class.card-future]="day.isFuture && !day.isToday"
                      [class.card-weekend]="day.isWeekend && !day.isToday"
                      [class.card-holiday]="day.isHoliday && !day.isToday"
                      class="day-card h-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 border"
                      [class.border-amber-400]="day.isToday"
                      [class.border-gray-300]="!day.isToday && !day.isWeekend && !day.isHoliday"
                      [class.border-gray-400]="!day.isToday && (day.isWeekend || day.isHoliday)"
                      [class.dark:border-amber-500]="day.isToday"
                      [class.dark:border-gray-600]="!day.isToday && !day.isWeekend && !day.isHoliday"
                      [class.dark:border-gray-500]="!day.isToday && (day.isWeekend || day.isHoliday)"
                    >
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
                        class="px-1.5 py-1 text-white relative overflow-hidden"
                      >
                        <div class="absolute inset-0 bg-black/10"></div>
                        <div class="relative z-10 text-center">
                          <div class="text-[9px] uppercase tracking-wide font-semibold opacity-90">
                            {{ day.dayName }}
                          </div>
                          <div class="text-xl font-bold">{{ day.dayNumber }}</div>
                        </div>
                        <!-- Déco géométrique -->
                        <div class="absolute -right-2 -bottom-2 w-12 h-12 bg-white/10 rounded-full"></div>
                      </div>

                      <!-- Corps de la carte - Événements -->
                      <div class="p-1.5 bg-white dark:bg-gray-800 min-h-[80px] max-h-[120px] overflow-y-auto custom-scrollbar-mini">
                        <div *ngIf="day.events.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                          <button
                            (click)="onAddEvent(day.dateStr)"
                            class="p-1 hover:bg-primary-100 dark:hover:bg-primary-900/20 rounded text-primary-500 transition-colors"
                            title="Ajouter"
                          >
                            <span class="material-icons text-sm">add_circle_outline</span>
                          </button>
                        </div>

                        <div *ngIf="day.events.length > 0" class="space-y-1">
                          <div
                            *ngFor="let event of day.events"
                            class="group relative bg-gray-50 dark:bg-gray-700/50 rounded p-1 hover:shadow-md transition-all duration-200 cursor-pointer border-l-2"
                            [style.border-left-color]="getEventColor(event)"
                            (click)="onEventClick(event)"
                          >
                            <div class="flex items-start gap-0.5">
                              <div
                                class="flex-shrink-0 w-3 h-3 rounded flex items-center justify-center mt-0.5"
                                [style.background-color]="getEventColor(event) + '20'"
                              >
                                <span
                                  class="material-icons"
                                  style="font-size: 10px;"
                                  [style.color]="getEventColor(event)"
                                >
                                  {{ event.icon }}
                                </span>
                              </div>
                              <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-gray-900 dark:text-white text-[11px] leading-tight line-clamp-2">
                                  {{ event.title }}
                                </h4>
                                <div *ngIf="event.startTime" class="text-[9px] text-gray-600 dark:text-gray-400">
                                  {{ event.startTime }}
                                </div>
                              </div>
                              <button
                                (click)="onDeleteEvent($event, event)"
                                class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/30 rounded p-0.5"
                                title="Supprimer"
                              >
                                <span class="material-icons text-red-600 dark:text-red-400" style="font-size: 12px;">delete</span>
                              </button>
                            </div>
                          </div>

                          <!-- Bouton ajouter en bas -->
                          <button
                            (click)="onAddEvent(day.dateStr)"
                            class="w-full py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-500 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors text-[10px] font-medium flex items-center justify-center"
                            title="Ajouter un événement"
                          >
                            <span class="material-icons" style="font-size: 14px;">add</span>
                          </button>
                        </div>
                      </div>

                      <!-- Footer -->
                      <div class="px-2 py-1 bg-gray-100 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-600">
                        <div class="flex items-center justify-between text-[9px] text-gray-600 dark:text-gray-400">
                          <span>{{ day.events.length }} evt</span>
                          <span *ngIf="day.isHoliday" class="text-red-500 dark:text-red-400">
                            <span class="material-icons" style="font-size: 10px;">celebration</span>
                          </span>
                          <span *ngIf="day.isWeekend && !day.isHoliday" class="text-gray-500 dark:text-gray-400">
                            <span class="material-icons" style="font-size: 10px;">weekend</span>
                          </span>
                        </div>
                      </div>
                    </div>
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
    .quarterly-view-container {
      min-height: 600px;
    }

    .day-card-mini {
      min-height: 180px;
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
        box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
      }
      50% {
        box-shadow: 0 0 25px rgba(251, 191, 36, 0.6);
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

    .custom-scrollbar-mini::-webkit-scrollbar {
      width: 4px;
    }

    .custom-scrollbar-mini::-webkit-scrollbar-track {
      background: transparent;
    }

    .custom-scrollbar-mini::-webkit-scrollbar-thumb {
      background: rgba(156, 163, 175, 0.3);
      border-radius: 2px;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class QuarterlyViewComponent implements OnChanges, AfterViewInit {
  @Input() events: Event[] | null = [];
  @Output() eventClick = new EventEmitter<Event>();
  @Output() addEventClick = new EventEmitter<string>();
  @Output() deleteEventClick = new EventEmitter<Event>();
  @ViewChild('scrollContainer') scrollContainer?: ElementRef;

  monthCards: MonthCard[] = [];
  isDark = false;

  // Gestion du scroll infini avec fenêtre glissante
  private readonly INITIAL_MONTHS_BEFORE = 0; // Mois courant en premier
  private readonly INITIAL_MONTHS_AFTER = 2; // 3 mois au total (trimestre)
  private readonly LOAD_MORE_THRESHOLD = 50; // px avant le bord pour charger plus (très strict)
  private readonly MAX_MONTHS_IN_MEMORY = 12; // Maximum de mois gardés en mémoire
  private readonly MONTHS_TO_LOAD = 3; // Nombre de mois à charger à chaque fois
  private startMonth: Date = new Date();
  private endMonth: Date = new Date();
  private isLoadingMore = false;
  private isFirstLoad = true; // Flag pour le premier chargement
  private shouldPreserveScroll = false; // Flag pour préserver le scroll
  private scrollInfiniteEnabled = false; // Désactiver le scroll infini au démarrage
  private lastScrollTop = 0; // Dernière position de scroll pour détecter la direction

  constructor(
    private settingsService: SettingsService,
    private timelineService: TimelineService,
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService
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
        this.scrollToTodayMonth();
      });

    this.initializeMonths();
  }

  ngOnChanges(): void {
    // Si ce n'est pas le premier chargement, préserver le scroll
    if (!this.isFirstLoad) {
      this.shouldPreserveScroll = true;
      const savedScrollTop = this.scrollContainer?.nativeElement?.scrollTop || 0;

      this.reloadMonthsOnly();

      // Restaurer la position de scroll après le rechargement
      setTimeout(() => {
        if (this.scrollContainer && savedScrollTop > 0) {
          this.scrollContainer.nativeElement.scrollTop = savedScrollTop;
        }
        this.shouldPreserveScroll = false;
      }, 0);
    }
  }

  ngAfterViewInit(): void {
    // Premier chargement : scroll à 0 (mois courant est déjà en haut)
    if (this.isFirstLoad && this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = 0;
      this.lastScrollTop = 0;
      this.isFirstLoad = false;

      // Activer le scroll infini après un délai pour éviter le déclenchement immédiat
      setTimeout(() => {
        this.scrollInfiniteEnabled = true;
      }, 500);
    }
  }

  private initializeMonths(): void {
    const state = this.timelineService.getCurrentState();
    const currentDate = state.currentDate;
    const currentMonth = startOfMonth(currentDate);

    // Définir la fenêtre initiale
    this.startMonth = subMonths(currentMonth, this.INITIAL_MONTHS_BEFORE);
    this.endMonth = addMonths(currentMonth, this.INITIAL_MONTHS_AFTER);

    this.loadMonthsInRange(this.startMonth, this.endMonth);
  }

  private loadMonthsInRange(start: Date, end: Date): void {
    const months: MonthCard[] = [];
    let current = new Date(start);

    while (current <= end) {
      months.push(this.createMonthCard(new Date(current)));
      current = addMonths(current, 1);
    }

    this.monthCards = months;
  }

  private reloadMonthsOnly(): void {
    // Recharger uniquement les événements pour les mois existants
    // sans changer les dates ni la structure
    this.monthCards = this.monthCards.map(monthCard => ({
      ...monthCard,
      days: monthCard.days.map(day => ({
        ...day,
        events: this.getEventsForDay(day.dateStr)
      }))
    }));
  }

  onScroll(event: any): void {
    // Ne pas charger plus si le scroll infini n'est pas activé
    if (!this.scrollInfiniteEnabled || this.isLoadingMore || !this.scrollContainer) return;

    const container = this.scrollContainer.nativeElement;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Détecter la direction du scroll
    const isScrollingUp = scrollTop < this.lastScrollTop;
    const isScrollingDown = scrollTop > this.lastScrollTop;

    // Charger plus en haut (mois passés) - SEULEMENT si on scrolle VERS LE HAUT
    if (isScrollingUp && scrollTop < this.LOAD_MORE_THRESHOLD) {
      this.loadMorePast();
    }

    // Charger plus en bas (mois futurs) - SEULEMENT si on scrolle VERS LE BAS
    if (isScrollingDown && scrollTop + clientHeight > scrollHeight - this.LOAD_MORE_THRESHOLD) {
      this.loadMoreFuture();
    }

    // Sauvegarder la position actuelle pour la prochaine fois
    this.lastScrollTop = scrollTop;
  }

  private loadMorePast(): void {
    this.isLoadingMore = true;

    const newStartMonth = subMonths(this.startMonth, this.MONTHS_TO_LOAD);
    const newMonths: MonthCard[] = [];

    let current = new Date(newStartMonth);
    while (current < this.startMonth) {
      newMonths.push(this.createMonthCard(new Date(current)));
      current = addMonths(current, 1);
    }

    // Ajouter au début
    this.monthCards = [...newMonths, ...this.monthCards];
    this.startMonth = newStartMonth;

    // Nettoyer la mémoire
    this.trimMemory();

    // Ajuster le scroll
    if (this.scrollContainer) {
      const addedHeight = newMonths.length * 800; // Estimation hauteur par mois
      this.scrollContainer.nativeElement.scrollTop += addedHeight;
    }

    setTimeout(() => {
      this.isLoadingMore = false;
    }, 100);
  }

  private loadMoreFuture(): void {
    this.isLoadingMore = true;

    const newEndMonth = addMonths(this.endMonth, this.MONTHS_TO_LOAD);
    const newMonths: MonthCard[] = [];

    let current = addMonths(this.endMonth, 1);
    while (current <= newEndMonth) {
      newMonths.push(this.createMonthCard(new Date(current)));
      current = addMonths(current, 1);
    }

    // Ajouter à la fin
    this.monthCards = [...this.monthCards, ...newMonths];
    this.endMonth = newEndMonth;

    // Nettoyer la mémoire
    this.trimMemory();

    setTimeout(() => {
      this.isLoadingMore = false;
    }, 100);
  }

  private trimMemory(): void {
    if (this.monthCards.length > this.MAX_MONTHS_IN_MEMORY) {
      const excess = this.monthCards.length - this.MAX_MONTHS_IN_MEMORY;
      const halfExcess = Math.floor(excess / 2);

      this.monthCards = this.monthCards.slice(halfExcess, this.monthCards.length - (excess - halfExcess));

      if (this.monthCards.length > 0) {
        this.startMonth = this.monthCards[0].month;
        this.endMonth = this.monthCards[this.monthCards.length - 1].month;
      }
    }
  }

  private createMonthCard(month: Date): MonthCard {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const allDays = eachDayOfInterval({ start, end });

    const days: DayCard[] = allDays.map(day => this.createDayCard(day));

    return {
      month,
      monthName: format(month, 'MMMM', { locale: fr }).charAt(0).toUpperCase() + format(month, 'MMMM', { locale: fr }).slice(1),
      year: month.getFullYear(),
      days
    };
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
      dayName: format(date, 'EEE', { locale: fr }).toUpperCase(),
      dayNumber: date.getDate(),
      monthName: format(date, 'MMM', { locale: fr }).toUpperCase(),
      isToday: isToday(date),
      isPast: compareDate < today,
      isFuture: compareDate > today,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isHoliday: this.isHoliday(date),
      weekNumber: this.getWeekNumber(date),
      events: this.getEventsForDay(dateStr)
    };
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  getWeeks(days: DayCard[]): DayCard[][] {
    const weeks: DayCard[][] = [];
    let currentWeek: DayCard[] = [];

    // Remplir les jours vides en début de mois
    const firstDay = days[0];
    const dayOfWeek = firstDay.date.getDay();
    const emptyDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lundi = 0

    for (let i = 0; i < emptyDays; i++) {
      // Créer un jour vide
      const emptyDate = new Date(firstDay.date);
      emptyDate.setDate(firstDay.date.getDate() - (emptyDays - i));
      currentWeek.push({
        ...this.createDayCard(emptyDate),
        events: []
      });
    }

    days.forEach(day => {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Compléter la dernière semaine si nécessaire
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const lastDay = currentWeek[currentWeek.length - 1];
        const nextDate = new Date(lastDay.date);
        nextDate.setDate(lastDay.date.getDate() + 1);
        currentWeek.push({
          ...this.createDayCard(nextDate),
          events: []
        });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }

  isHoliday(day: Date): boolean {
    const year = day.getFullYear();
    const month = day.getMonth() + 1;
    const date = day.getDate();

    const fixedHolidays = [
      { month: 1, date: 1 },
      { month: 5, date: 1 },
      { month: 5, date: 8 },
      { month: 7, date: 14 },
      { month: 8, date: 15 },
      { month: 11, date: 1 },
      { month: 11, date: 11 },
      { month: 12, date: 25 }
    ];

    if (fixedHolidays.some(h => h.month === month && h.date === date)) {
      return true;
    }

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

  scrollToTodayMonth(): void {
    // Réinitialiser complètement la vue
    this.isLoadingMore = true;
    this.isFirstLoad = true;
    this.scrollInfiniteEnabled = false; // Désactiver temporairement

    // Réinitialiser les mois pour que le mois courant soit en premier
    const today = new Date();
    const currentMonth = startOfMonth(today);
    this.startMonth = subMonths(currentMonth, this.INITIAL_MONTHS_BEFORE);
    this.endMonth = addMonths(currentMonth, this.INITIAL_MONTHS_AFTER);
    this.loadMonthsInRange(this.startMonth, this.endMonth);

    // Attendre que le DOM soit mis à jour puis forcer le scroll à 0
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = 0;
      }
      this.isLoadingMore = false;
      this.isFirstLoad = false;

      // Réactiver le scroll infini après un délai
      setTimeout(() => {
        this.scrollInfiniteEnabled = true;
      }, 500);
    }, 0);
  }
}
