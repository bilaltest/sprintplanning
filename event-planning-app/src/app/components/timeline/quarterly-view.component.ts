import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Event, EventCategory, CATEGORY_COLORS_DARK } from '@models/event.model';
import { TimelineService } from '@services/timeline.service';
import { SettingsService } from '@services/settings.service';
import { CategoryService } from '@services/category.service';
import { ConfirmationService } from '@services/confirmation.service';
import { format, getDaysInMonth, getDay, isToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-quarterly-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quarterly-view">
      <!-- 3 mois en colonne -->
      <div class="space-y-6">
        <div
          *ngFor="let month of months; let i = index"
          [attr.data-month-index]="i"
          [id]="'month-' + i"
          class="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
        >
          <!-- En-tête mois -->
          <div class="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3">
            <h3 class="text-lg font-semibold">
              {{ getMonthName(month) }}
            </h3>
          </div>

          <!-- Calendrier du mois -->
          <div class="p-3">
            <!-- Jours de la semaine -->
            <div class="grid grid-cols-7 gap-1 mb-2">
              <div
                *ngFor="let day of daysOfWeek"
                class="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-1"
              >
                {{ day }}
              </div>
            </div>

            <!-- Grille des jours -->
            <div class="grid grid-cols-7 gap-1">
              <!-- Empty cells for days before month starts -->
              <div
                *ngFor="let _ of getEmptyDays(month)"
                class="h-[90px]"
              ></div>

              <!-- Days of month -->
              <div
                *ngFor="let day of getDaysInMonth(month)"
                [attr.data-date]="formatDate(day)"
                [class.bg-primary-50]="isToday(day)"
                [class.dark:bg-primary-900/20]="isToday(day)"
                [class.ring-2]="isToday(day)"
                [class.ring-primary-500]="isToday(day)"
                [class.bg-gray-100]="isWeekendOrHoliday(day) && !isToday(day)"
                [class.dark:bg-gray-800/50]="isWeekendOrHoliday(day) && !isToday(day)"
                class="h-[95px] border border-gray-200 dark:border-gray-600 rounded p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative group"
                (click)="handleDayClick(day)"
              >
                <div class="flex flex-col h-full">
                  <!-- Day number -->
                  <div
                    [class.font-bold]="isToday(day)"
                    [class.text-primary-600]="isToday(day) && !isDark"
                    [class.dark:text-primary-400]="isToday(day)"
                    class="text-xs text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {{ day.getDate() }}
                  </div>

                  <!-- Events for this day -->
                  <div class="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar">
                    <div
                      *ngFor="let event of getEventsForDay(day)"
                      [style.background-color]="getEventColor(event)"
                      [class.rounded-l-none]="isPeriodEvent(event) && !isFirstDayOfPeriod(event, day)"
                      [class.rounded-r-none]="isPeriodEvent(event) && !isLastDayOfPeriod(event, day)"
                      class="text-[10px] text-white px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center space-x-1"
                      [title]="getEventTitle(event, day)"
                      (click)="onEventClick($event, event)"
                    >
                      <span class="material-icons" style="font-size: 10px;">{{ event.icon }}</span>
                      <span class="truncate">{{ event.title }}</span>
                    </div>

                    <!-- More events indicator -->
                    <div
                      *ngIf="getEventsForDay(day).length > 3"
                      class="text-[9px] text-gray-500 dark:text-gray-400 px-1"
                    >
                      +{{ getEventsForDay(day).length - 3 }} autres
                    </div>
                  </div>

                  <!-- Add event button (shown on hover) -->
                  <button
                    class="absolute bottom-1 right-1 p-0.5 bg-primary-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    (click)="onAddEvent($event, day)"
                    title="Ajouter un événement"
                  >
                    <span class="material-icons" style="font-size: 12px;">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panneau latéral détails du jour -->
      <div
        *ngIf="selectedDay"
        class="fixed right-4 top-20 w-80 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-750 p-4 shadow-xl animate-slide-in-right z-50"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ formatSelectedDay() }}
          </h3>
          <button
            (click)="closeDetails()"
            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <span class="material-icons text-gray-500 dark:text-gray-400 text-xl">close</span>
          </button>
        </div>

        <div *ngIf="getEventsForDay(selectedDay).length === 0" class="text-center py-8">
          <span class="material-icons text-gray-300 dark:text-gray-600 text-5xl mb-2">event_busy</span>
          <p class="text-gray-500 dark:text-gray-400 text-sm">Aucun événement ce jour</p>

          <!-- Add event button in detail panel -->
          <button
            (click)="onAddEventFromPanel(selectedDay)"
            class="btn btn-primary mt-4"
          >
            <span class="material-icons text-sm">add</span>
            Créer un événement
          </button>
        </div>

        <div *ngIf="getEventsForDay(selectedDay).length > 0">
          <!-- Add event button in detail panel when events exist -->
          <button
            (click)="onAddEventFromPanel(selectedDay)"
            class="btn btn-primary w-full mb-3"
          >
            <span class="material-icons text-sm">add</span>
            Créer un événement
          </button>

          <div class="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
            <div
              *ngFor="let event of getEventsForDay(selectedDay)"
              [style.border-left-color]="getEventColor(event)"
              class="border-l-4 pl-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-r hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <div class="flex items-start space-x-2">
                <span
                  class="material-icons text-lg mt-0.5 cursor-pointer"
                  [style.color]="getEventColor(event)"
                  (click)="onEventClickFromPanel(event)"
                >
                  {{ event.icon }}
                </span>
                <div class="flex-1 min-w-0 cursor-pointer" (click)="onEventClickFromPanel(event)">
                  <h4 class="font-medium text-gray-900 dark:text-white text-sm">
                    {{ event.title }}
                  </h4>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    <span class="inline-flex items-center space-x-1">
                      <span class="material-icons" style="font-size: 14px;">label</span>
                      <span>{{ getCategoryLabel(event.category) }}</span>
                    </span>
                  </p>
                  <p *ngIf="event.endDate" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <span class="material-icons" style="font-size: 14px;">date_range</span>
                    {{ formatEventPeriod(event) }}
                  </p>
                  <p *ngIf="event.description" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ event.description }}
                  </p>
                </div>
                <button
                  (click)="onDeleteEvent($event, event)"
                  class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Supprimer cet événement"
                >
                  <span class="material-icons text-red-600 dark:text-red-400 text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quarterly-view {
      min-height: 500px;
    }
  `]
})
export class QuarterlyViewComponent implements AfterViewInit {
  @Input() events: Event[] | null = [];
  @Output() eventClick = new EventEmitter<Event>();
  @Output() addEventClick = new EventEmitter<string>();
  @Output() deleteEventClick = new EventEmitter<Event>();

  months: Date[] = [];
  selectedDay: Date | null = null;
  isDark = false;
  daysOfWeek: string[] = [];

  constructor(
    private timelineService: TimelineService,
    private settingsService: SettingsService,
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private elementRef: ElementRef
  ) {
    // Subscriptions avec cleanup automatique
    this.timelineService.state$
      .pipe(takeUntilDestroyed())
      .subscribe(state => {
        // Afficher 3 mois du trimestre
        const currentMonth = state.currentDate.getMonth();
        const year = state.currentDate.getFullYear();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;

        this.months = Array.from({ length: 3 }, (_, i) =>
          new Date(year, quarterStartMonth + i, 1)
        );
      });

    // Détecter le mode sombre
    this.settingsService.preferences$
      .pipe(takeUntilDestroyed())
      .subscribe(prefs => {
        this.isDark = prefs.theme === 'dark';
        this.updateDaysOfWeek(true); // Toujours commencer par lundi
      });

    // Écouter le signal de scroll vers aujourd'hui
    this.timelineService.scrollToToday$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        setTimeout(() => {
          this.scrollToCurrentMonth();
        }, 100);
      });
  }

  ngAfterViewInit(): void {
    // Ne plus faire de scroll automatique au chargement
  }

  private updateDaysOfWeek(startMonday: boolean): void {
    if (startMonday) {
      this.daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    } else {
      this.daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    }
  }

  private scrollToCurrentMonth(): void {
    const currentMonth = new Date().getMonth();
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
    const monthIndexInQuarter = currentMonth - quarterStartMonth;

    const monthElement = this.elementRef.nativeElement.querySelector(`#month-${monthIndexInQuarter}`);
    if (monthElement) {
      monthElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  getMonthName(month: Date): string {
    const monthName = format(month, 'MMMM yyyy', { locale: fr });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  }

  getDaysInMonth(month: Date): Date[] {
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    const daysCount = getDaysInMonth(month);
    return Array.from({ length: daysCount }, (_, i) => new Date(year, monthNum, i + 1));
  }

  getEmptyDays(month: Date): number[] {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const startDayOfWeek = firstDay.getDay();

    // Ajuster pour commencer par lundi
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    return Array(offset).fill(0);
  }

  isWeekendOrHoliday(day: Date): boolean {
    const dayOfWeek = day.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6 || this.isHoliday(day);
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

  getEventsForDay(day: Date): Event[] {
    if (!this.events) return [];
    const dateStr = format(day, 'yyyy-MM-dd');
    return this.events.filter(event => {
      // Si l'événement a une date de fin (période)
      if (event.endDate) {
        return dateStr >= event.date && dateStr <= event.endDate;
      }
      // Sinon, événement d'un seul jour
      return event.date === dateStr;
    }).slice(0, 4);
  }

  isToday(day: Date): boolean {
    return isToday(day);
  }

  formatDate(day: Date): string {
    return format(day, 'yyyy-MM-dd');
  }

  handleDayClick(day: Date): void {
    const dayEvents = this.getEventsForDay(day);
    if (dayEvents.length > 0) {
      // If there are events, show the detail panel
      this.selectedDay = day;
    } else {
      // If no events, directly add an event
      const dateStr = format(day, 'yyyy-MM-dd');
      this.addEventClick.emit(dateStr);
    }
  }

  closeDetails(): void {
    this.selectedDay = null;
  }

  formatSelectedDay(): string {
    if (!this.selectedDay) return '';
    return format(this.selectedDay, 'EEEE d MMMM yyyy', { locale: fr });
  }

  getCategoryLabel(categoryId: string): string {
    return this.categoryService.getCategoryLabel(categoryId);
  }

  onEventClick(mouseEvent: MouseEvent, event: Event): void {
    mouseEvent.stopPropagation();
    this.eventClick.emit(event);
  }

  onEventClickFromPanel(event: Event): void {
    this.eventClick.emit(event);
  }

  onAddEvent(mouseEvent: MouseEvent, day: Date): void {
    mouseEvent.stopPropagation();
    const dateStr = format(day, 'yyyy-MM-dd');
    this.addEventClick.emit(dateStr);
  }

  onAddEventFromPanel(day: Date): void {
    const dateStr = format(day, 'yyyy-MM-dd');
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

  getEventColor(event: Event): string {
    // En mode sombre, utiliser les couleurs adaptées
    if (this.isDark) {
      // Pour les catégories par défaut, utiliser la couleur dark mode
      // Pour les catégories personnalisées, utiliser leur couleur directement
      return CATEGORY_COLORS_DARK[event.category] || event.color;
    }
    return event.color;
  }

  isPeriodEvent(event: Event): boolean {
    return !!event.endDate && event.endDate !== event.date;
  }

  isFirstDayOfPeriod(event: Event, day: Date): boolean {
    if (!event.endDate) return true;
    const dateStr = format(day, 'yyyy-MM-dd');
    return dateStr === event.date;
  }

  isLastDayOfPeriod(event: Event, day: Date): boolean {
    if (!event.endDate) return true;
    const dateStr = format(day, 'yyyy-MM-dd');
    return dateStr === event.endDate;
  }

  getEventTitle(event: Event, day: Date): string {
    if (!event.endDate) return event.title;
    const dateStr = format(day, 'yyyy-MM-dd');
    if (dateStr === event.date) {
      return `${event.title} (Début)`;
    } else if (dateStr === event.endDate) {
      return `${event.title} (Fin)`;
    }
    return `${event.title} (En cours)`;
  }

  formatEventPeriod(event: Event): string {
    if (!event.endDate) return '';
    const startDate = new Date(event.date);
    const endDate = new Date(event.endDate);
    return `${format(startDate, 'd MMM', { locale: fr })} - ${format(endDate, 'd MMM yyyy', { locale: fr })}`;
  }
}
