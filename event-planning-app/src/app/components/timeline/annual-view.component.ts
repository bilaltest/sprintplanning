import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Event, EventCategory, CATEGORY_COLORS_DARK } from '@models/event.model';
import { TimelineService } from '@services/timeline.service';
import { SettingsService } from '@services/settings.service';
import { CategoryService } from '@services/category.service';
import { format, getDaysInMonth, getDay, isToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-annual-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="annual-view">
      <!-- Grille 2 colonnes × 6 lignes (12 mois) -->
      <div class="grid grid-cols-2 gap-4">
        <div
          *ngFor="let month of months; let i = index"
          [attr.data-month-index]="i"
          [id]="'month-' + i"
          class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <!-- En-tête mois -->
          <div class="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-2">
            <h3 class="text-sm font-semibold">
              {{ getMonthName(month) }}
            </h3>
          </div>

          <!-- Grille compacte des jours du mois -->
          <div class="p-2">
            <!-- Jours de la semaine -->
            <div class="grid grid-cols-7 gap-0.5 mb-1">
              <div
                *ngFor="let day of daysOfWeek"
                class="text-center text-[9px] font-semibold text-gray-500 dark:text-gray-400 py-0.5"
              >
                {{ day }}
              </div>
            </div>

            <!-- Grille des jours -->
            <div class="grid grid-cols-7 gap-0.5">
              <!-- Empty cells for days before month starts -->
              <div
                *ngFor="let _ of getEmptyDays(month)"
                class="aspect-square"
              ></div>

              <!-- Days of month -->
              <div
                *ngFor="let day of getDaysInMonth(month)"
                [class.bg-primary-50]="isToday(day)"
                [class.dark:bg-primary-900/20]="isToday(day)"
                [class.ring-1]="isToday(day)"
                [class.ring-primary-500]="isToday(day)"
                [class.bg-blue-50]="isWeekend(day) && !isToday(day)"
                [class.dark:bg-blue-900/10]="isWeekend(day) && !isToday(day)"
                class="border border-gray-200 dark:border-gray-700 rounded p-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative min-h-[60px]"
                (click)="handleDayClick(day)"
              >
                <div class="flex flex-col h-full space-y-0.5">
                  <!-- Day number -->
                  <div
                    [class.font-bold]="isToday(day)"
                    [class.text-primary-600]="isToday(day)"
                    [class.dark:text-primary-400]="isToday(day)"
                    class="text-[9px] text-gray-700 dark:text-gray-300 text-center mb-0.5"
                  >
                    {{ day.getDate() }}
                  </div>

                  <!-- Events list -->
                  <div class="flex-1 space-y-0.5 overflow-hidden">
                    <div
                      *ngFor="let event of getEventsForDay(day).slice(0, 3)"
                      [style.background-color]="getEventColor(event)"
                      class="px-1 py-0.5 rounded text-white text-[8px] leading-tight truncate flex items-center space-x-0.5"
                      [title]="event.title"
                      (click)="onEventClick(event); $event.stopPropagation()"
                    >
                      <span class="material-icons" style="font-size: 8px;">{{ event.icon }}</span>
                      <span class="truncate flex-1">{{ event.title }}</span>
                    </div>

                    <div
                      *ngIf="getEventsForDay(day).length > 3"
                      class="text-[7px] text-gray-500 dark:text-gray-400 text-center"
                    >
                      +{{ getEventsForDay(day).length - 3 }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panneau latéral détails du jour -->
      <div
        *ngIf="selectedDay"
        class="fixed right-4 top-20 w-80 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900 p-4 shadow-xl animate-slide-in-right z-50"
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
                  (click)="onEventClick(event)"
                >
                  {{ event.icon }}
                </span>
                <div class="flex-1 min-w-0 cursor-pointer" (click)="onEventClick(event)">
                  <h4 class="font-medium text-gray-900 dark:text-white text-sm">
                    {{ event.title }}
                  </h4>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    <span class="inline-flex items-center space-x-1">
                      <span class="material-icons" style="font-size: 14px;">label</span>
                      <span>{{ getCategoryLabel(event.category) }}</span>
                    </span>
                  </p>
                  <p *ngIf="event.startTime" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <span class="material-icons" style="font-size: 14px;">schedule</span>
                    {{ event.startTime }}
                    <span *ngIf="event.endTime"> - {{ event.endTime }}</span>
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
    .annual-view {
      min-height: 500px;
    }
  `]
})
export class AnnualViewComponent implements AfterViewInit {
  @Input() events: Event[] | null = [];
  @Output() eventClick = new EventEmitter<Event>();
  @Output() addEventClick = new EventEmitter<string>();
  @Output() deleteEventClick = new EventEmitter<Event>();

  months: Date[] = [];
  selectedDay: Date | null = null;
  isDarkMode = false;
  daysOfWeek: string[] = [];

  constructor(
    private timelineService: TimelineService,
    private settingsService: SettingsService,
    private categoryService: CategoryService,
    private elementRef: ElementRef
  ) {
    // Subscriptions avec cleanup automatique
    this.timelineService.state$
      .pipe(takeUntilDestroyed())
      .subscribe(state => {
        // Afficher les 12 mois de l'année (vue annuelle)
        const year = state.currentDate.getFullYear();
        this.months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
      });

    // Détecter le mode sombre
    this.settingsService.preferences$
      .pipe(takeUntilDestroyed())
      .subscribe(prefs => {
        this.isDarkMode = prefs.theme === 'dark';
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
      this.daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    } else {
      this.daysOfWeek = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    }
  }

  private scrollToCurrentMonth(): void {
    const currentMonth = new Date().getMonth();
    const monthElement = this.elementRef.nativeElement.querySelector(`#month-${currentMonth}`);
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

  isWeekend(day: Date): boolean {
    const dayOfWeek = getDay(day);
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  getEventsForDay(day: Date): Event[] {
    if (!this.events) return [];
    const dateStr = format(day, 'yyyy-MM-dd');
    return this.events.filter(event => event.date === dateStr);
  }

  isToday(day: Date): boolean {
    return isToday(day);
  }

  isSelectedDay(day: Date): boolean {
    if (!this.selectedDay) return false;
    return isSameDay(day, this.selectedDay);
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

  onEventClick(event: Event): void {
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

  onDeleteEvent(mouseEvent: MouseEvent, event: Event): void {
    mouseEvent.stopPropagation();
    const confirmed = confirm(
      `Voulez-vous vraiment supprimer l'événement "${event.title}" ?`
    );
    if (confirmed) {
      this.deleteEventClick.emit(event);
    }
  }

  getEventColor(event: Event): string {
    // En mode sombre, utiliser les couleurs adaptées
    if (this.isDarkMode) {
      return CATEGORY_COLORS_DARK[event.category];
    }
    return event.color;
  }
}
