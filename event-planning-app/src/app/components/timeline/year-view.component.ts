import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '@models/event.model';
import { TimelineService } from '@services/timeline.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-year-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="year-view">
      <div class="grid grid-cols-3 gap-4">
        <div
          *ngFor="let month of months"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          (click)="onMonthClick(month)"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {{ getMonthName(month) }}
          </h3>

          <div class="space-y-1">
            <div
              *ngFor="let event of getEventsForMonth(month).slice(0, 5)"
              [style.border-left-color]="event.color"
              class="text-sm border-l-4 pl-2 py-1 flex items-center space-x-2"
            >
              <span class="material-icons text-gray-600 dark:text-gray-400" style="font-size: 16px;">
                {{ event.icon }}
              </span>
              <span class="truncate text-gray-700 dark:text-gray-300">
                {{ event.title }}
              </span>
            </div>

            <div
              *ngIf="getEventsForMonth(month).length > 5"
              class="text-xs text-gray-500 dark:text-gray-400 pl-2"
            >
              +{{ getEventsForMonth(month).length - 5 }} événements
            </div>

            <div
              *ngIf="getEventsForMonth(month).length === 0"
              class="text-sm text-gray-400 dark:text-gray-500 italic pl-2"
            >
              Aucun événement
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .year-view {
      min-height: 500px;
    }
  `]
})
export class YearViewComponent {
  @Input() events: Event[] | null = [];

  months: Date[] = [];

  constructor(private timelineService: TimelineService) {
    this.timelineService.state$.subscribe(state => {
      const year = state.currentDate.getFullYear();
      this.months = this.timelineService.getYearMonths(year);
    });
  }

  getMonthName(month: Date): string {
    return format(month, 'MMMM', { locale: fr });
  }

  getEventsForMonth(month: Date): Event[] {
    if (!this.events) return [];
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === monthNum;
    });
  }

  onMonthClick(month: Date): void {
    this.timelineService.setCurrentDate(month);
    this.timelineService.setView('month');
  }
}
