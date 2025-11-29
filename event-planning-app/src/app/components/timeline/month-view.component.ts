import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event, CATEGORY_COLORS_DARK } from '@models/event.model';
import { TimelineService } from '@services/timeline.service';
import { SettingsService } from '@services/settings.service';
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
          (click)="onDayClick(day)"
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

  daysOfWeek: string[] = [];
  days: Date[] = [];
  emptyDays: number[] = [];
  isDark = false;

  private currentMonth!: Date;

  constructor(
    private timelineService: TimelineService,
    private settingsService: SettingsService
  ) {
    this.timelineService.state$.subscribe(state => {
      this.currentMonth = state.currentDate;
      this.generateCalendar();
    });

    this.settingsService.preferences$.subscribe(prefs => {
      this.isDark = prefs.theme === 'dark';
      this.updateDaysOfWeek(prefs.weekStart === 'monday');
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

    // Adjust for week start
    const prefs = this.settingsService.getCurrentPreferences();
    const offset = prefs.weekStart === 'monday' ? (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1) : startDayOfWeek;

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

  onDayClick(day: Date): void {
    this.timelineService.selectDate(day);
  }

  onEventClick(mouseEvent: MouseEvent, event: Event): void {
    mouseEvent.stopPropagation();
    this.eventClick.emit(event);
  }

  onAddEvent(mouseEvent: MouseEvent, day: Date): void {
    mouseEvent.stopPropagation();
    const dateStr = format(day, 'yyyy-MM-dd');
    this.addEventClick.emit(dateStr);
  }

  getEventColor(event: Event): string {
    // En mode sombre, utiliser les couleurs adaptées
    if (this.isDark) {
      return CATEGORY_COLORS_DARK[event.category];
    }
    return event.color;
  }
}
