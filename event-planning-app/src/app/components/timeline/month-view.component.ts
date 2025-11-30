import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Event, CATEGORY_COLORS_DARK, EventCategory } from '@models/event.model';
import { TimelineService } from '@services/timeline.service';
import { SettingsService } from '@services/settings.service';
import { CategoryService } from '@services/category.service';
import { format, isSameDay, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-month-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="month-view">
      <!-- Days of week header -->
      <div class="grid grid-cols-7 gap-2 mb-4">
        <div
          *ngFor="let day of daysOfWeek"
          class="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-2">
        <!-- Empty cells for days before month starts -->
        <div
          *ngFor="let _ of emptyDays"
          class="aspect-square"
        ></div>

        <!-- Days of month -->
        <div
          *ngFor="let day of days"
          [class.bg-primary-50]="isToday(day) && !isDark"
          [class.dark:bg-primary-900/20]="isToday(day)"
          [class.ring-2]="isToday(day)"
          [class.ring-primary-500]="isToday(day)"
          class="aspect-square border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative group"
          (click)="handleDayClick(day)"
        >
          <div class="flex flex-col h-full">
            <!-- Day number -->
            <div
              [class.font-bold]="isToday(day)"
              [class.text-primary-600]="isToday(day) && !isDark"
              [class.dark:text-primary-400]="isToday(day)"
              class="text-sm text-gray-700 dark:text-gray-300 mb-1"
            >
              {{ day.getDate() }}
            </div>

            <!-- Events for this day -->
            <div class="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
              <div
                *ngFor="let event of getEventsForDay(day)"
                [style.background-color]="getEventColor(event)"
                class="text-xs text-white px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center space-x-1"
                [title]="event.title"
                (click)="onEventClick($event, event)"
              >
                <span class="material-icons" style="font-size: 12px;">{{ event.icon }}</span>
                <span class="truncate">{{ event.title }}</span>
              </div>

              <!-- More events indicator -->
              <div
                *ngIf="getEventsForDay(day).length > 3"
                class="text-xs text-gray-500 dark:text-gray-400 px-2"
              >
                +{{ getEventsForDay(day).length - 3 }} autres
              </div>
            </div>

            <!-- Add event button (shown on hover) -->
            <button
              class="absolute bottom-1 right-1 p-1 bg-primary-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              (click)="onAddEvent($event, day)"
              title="Ajouter un événement"
            >
              <span class="material-icons" style="font-size: 14px;">add</span>
            </button>
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
    .month-view {
      min-height: 600px;
    }

    .aspect-square {
      aspect-ratio: 1 / 1;
    }
  `]
})
export class MonthViewComponent implements OnChanges {
  @Input() events: Event[] | null = [];
  @Output() eventClick = new EventEmitter<Event>();
  @Output() addEventClick = new EventEmitter<string>();
  @Output() deleteEventClick = new EventEmitter<Event>();

  daysOfWeek: string[] = [];
  days: Date[] = [];
  emptyDays: number[] = [];
  isDark = false;
  selectedDay: Date | null = null;

  private currentMonth!: Date;

  constructor(
    private timelineService: TimelineService,
    private settingsService: SettingsService,
    private categoryService: CategoryService
  ) {
    // Subscriptions avec cleanup automatique
    this.timelineService.state$
      .pipe(takeUntilDestroyed())
      .subscribe(state => {
        this.currentMonth = state.currentDate;
        this.generateCalendar();
      });

    this.settingsService.preferences$
      .pipe(takeUntilDestroyed())
      .subscribe(prefs => {
        this.isDark = prefs.theme === 'dark';
        this.updateDaysOfWeek(true); // Toujours commencer par lundi
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      // Re-render when events change
    }
  }

  private updateDaysOfWeek(startMonday: boolean): void {
    if (startMonday) {
      this.daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    } else {
      this.daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    }
  }

  private generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Ajuster pour commencer par lundi
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    this.emptyDays = Array(offset).fill(0);
    this.days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  }

  getEventsForDay(day: Date): Event[] {
    if (!this.events) return [];
    const dateStr = format(day, 'yyyy-MM-dd');
    return this.events.filter(event => event.date === dateStr).slice(0, 4);
  }

  isToday(day: Date): boolean {
    return isToday(day);
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
    if (this.isDark) {
      return CATEGORY_COLORS_DARK[event.category];
    }
    return event.color;
  }
}
