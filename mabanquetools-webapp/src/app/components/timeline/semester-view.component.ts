import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event, CATEGORY_COLORS_DARK } from '@models/event.model';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWeekend,
  isToday,
  getDate,
  getMonth,
  getYear
} from 'date-fns';
import { fr } from 'date-fns/locale';

interface DayCell {
  date: Date;
  dayNumber: number;
  dayLetter: string; // L, M, M, J, V, S, D
  isWeekend: boolean;
  isHoliday: boolean;
  isToday: boolean;
  events: Event[];
  isValid: boolean; // false for days that don't exist in the month (e.g., Feb 30)
}

interface MonthColumn {
  date: Date;
  name: string;
  year: number;
  cells: DayCell[]; // Always 31 cells, some invalid
}

@Component({
  selector: 'app-semester-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="semester-view-container h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
      
      <!-- Decorative Background Elements -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 z-20"></div>
      <div class="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header Controls -->
      <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700/50 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 z-10">
        <div class="flex items-center space-x-4">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {{ semesterLabel }}
          </h2>
          <div class="flex space-x-1">
            <button (click)="prevSemester()" class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
              <span class="material-icons text-xl">chevron_left</span>
            </button>
            <button (click)="goToToday()" class="px-3 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              Aujourd'hui
            </button>
            <button (click)="nextSemester()" class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
              <span class="material-icons text-xl">chevron_right</span>
            </button>
          </div>
        </div>
        
        <!-- Legend (Optional/Minimal) -->
        <div class="hidden md:flex items-center space-x-3 text-xs text-gray-400">
          <div class="flex items-center"><span class="w-2 h-2 rounded-full bg-red-400/20 border border-red-400 mr-1.5"></span> Férié</div>
          <div class="flex items-center"><span class="w-2 h-2 rounded-full bg-slate-400/20 border border-slate-400 mr-1.5"></span> Week-end</div>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="flex-1 overflow-auto custom-scrollbar relative z-0">
        <div class="min-w-[800px] h-full flex">
          
          <!-- Month Columns -->
          <div *ngFor="let month of months" class="flex-1 min-w-[130px] border-r border-dashed border-gray-100 dark:border-gray-700/50 last:border-r-0 flex flex-col group transition-colors hover:bg-gray-50/30 dark:hover:bg-gray-700/10">
            
            <!-- Month Header -->
            <div class="sticky top-0 z-10 py-3 text-center border-b border-gray-100 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <div class="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ month.name }}
              </div>
              <div class="text-[10px] text-gray-400 font-medium">{{ month.year }}</div>
            </div>

            <!-- Days Grid -->
            <div class="flex-1 flex flex-col p-1 gap-[1px]">
              <div *ngFor="let cell of month.cells; let i = index" 
                   class="flex-1 min-h-[48px] relative rounded-md transition-all duration-200 group/cell"
                   [class.opacity-0]="!cell.isValid"
                   [class.pointer-events-none]="!cell.isValid"
                   [class.bg-amber-500-10]="cell.isToday"
                   [class.dark:bg-amber-500-20]="cell.isToday"
                   [class.bg-holiday-custom]="cell.isHoliday && !cell.isToday"
                   [class.bg-weekend-custom]="cell.isWeekend && !cell.isHoliday && !cell.isToday"
                   [ngClass]="getBgClass(cell)"
                   (click)="onCellClick(cell)"
              >
                
                <!-- Day Content -->
                <div class="absolute inset-0 flex items-center px-2">
                  
                  <!-- Date Number & Letter -->
                  <div class="w-6 flex flex-col items-center justify-center mr-2 shrink-0">
                    <span class="text-[11px] font-bold leading-none"
                          [class.text-amber-600]="cell.isToday"
                          [class.dark:text-amber-400]="cell.isToday"
                          [class.text-red-500]="cell.isHoliday && !cell.isToday"
                          [class.text-gray-400]="!cell.isToday && !cell.isHoliday"
                    >
                      {{ cell.dayNumber }}
                    </span>
                    <span class="text-[9px] uppercase leading-none mt-0.5"
                          [class.text-amber-500]="cell.isToday"
                          [class.text-red-400]="cell.isHoliday && !cell.isToday"
                          [class.text-gray-300]="!cell.isToday && !cell.isHoliday"
                    >
                      {{ cell.dayLetter }}
                    </span>
                  </div>

                  <!-- Events Strip -->
                  <div class="flex-1 flex items-center gap-1 overflow-hidden h-full py-0.5">
                    
                    <!-- Empty Slot Placeholder (Hover) -->
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 pointer-events-none" *ngIf="cell.events.length === 0">
                      <span class="material-icons text-[16px] text-gray-300 dark:text-gray-600">add</span>
                    </div>

                    <!-- Event Chips -->
                    <div *ngFor="let event of cell.events" 
                         class="relative group/event z-10 max-w-full flex-shrink overflow-hidden flex items-center bg-white dark:bg-gray-700/80 rounded-full border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-all cursor-pointer pr-3 mr-1 h-8"
                         [style.border-left-color]="event.color"
                         (click)="onEventClick($event, event)"
                    >
                      <!-- Icon -->
                      <div class="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0 ml-0.5"
                           [style.background-color]="event.color"
                      >
                         <span class="material-icons text-[14px]">{{ event.icon || 'event' }}</span>
                      </div>

                      <!-- Title -->
                      <span class="ml-2 text-[12px] font-medium text-gray-800 dark:text-gray-100 truncate flex items-center h-full pb-0.5">
                        {{ event.title }}
                      </span>

                      <!-- Tooltip -->
                      <div class="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-max max-w-[150px] px-2 py-1 bg-gray-900/90 text-white text-[10px] rounded shadow-lg opacity-0 group-hover/event:opacity-100 transition-opacity pointer-events-none z-50 whitespace-normal text-center backdrop-blur-sm">
                        {{ event.title }}
                        <div class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/90"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Today Highlight Border -->
                <div *ngIf="cell.isToday" class="absolute inset-0 border border-amber-400 rounded-md pointer-events-none ring-1 ring-amber-400/30"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(156, 163, 175, 0.3);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(156, 163, 175, 0.5);
    }
    
    .bg-amber-500-10 { background-color: rgba(245, 158, 11, 0.1); }
    .bg-amber-500-20 { background-color: rgba(245, 158, 11, 0.2); }
    
    .bg-weekend-custom { background-color: #EDF1F5; }
    :host-context(.dark) .bg-weekend-custom { background-color: rgba(255, 255, 255, 0.02); }

    .bg-holiday-custom { background-color: #FEE2E2; }
    :host-context(.dark) .bg-holiday-custom { background-color: rgba(154, 39, 39, 0.2); }
  `]
})
export class SemesterViewComponent implements OnInit, OnChanges {
  @Input() events: Event[] | null = [];
  @Output() eventClick = new EventEmitter<Event>();
  @Output() addEventClick = new EventEmitter<string>();

  currentDate: Date = new Date();
  months: MonthColumn[] = [];
  semesterLabel: string = '';

  ngOnInit() {
    this.updateView();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['events']) {
      this.updateView();
    }
  }

  updateView() {
    // Determine start of semester (Jan or Jul)
    const currentMonth = getMonth(this.currentDate);
    const startMonthIndex = currentMonth < 6 ? 0 : 6;
    const year = getYear(this.currentDate);

    const semesterStart = new Date(year, startMonthIndex, 1);
    const semesterEnd = endOfMonth(addMonths(semesterStart, 5));

    this.semesterLabel = `Semestre ${currentMonth < 6 ? '1' : '2'} - ${year}`;

    this.months = [];

    // Generate 6 months
    for (let i = 0; i < 6; i++) {
      const monthDate = addMonths(semesterStart, i);
      const daysInMonth = endOfMonth(monthDate).getDate();
      const cells: DayCell[] = [];

      // Generate 31 lines for each month (standard paper calendar format)
      for (let day = 1; day <= 31; day++) {
        if (day <= daysInMonth) {
          const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
          const dayStr = format(date, 'yyyy-MM-dd');

          cells.push({
            date,
            dayNumber: day,
            dayLetter: format(date, 'EEEEE', { locale: fr }).toUpperCase(), // 'L', 'M', etc.
            isWeekend: isWeekend(date),
            isHoliday: this.isHoliday(date),
            isToday: isToday(date),
            events: this.getEventsForDay(dayStr),
            isValid: true
          });
        } else {
          // Invalid days (e.g., Feb 30) - placeholder
          cells.push({
            date: new Date(), // dummy
            dayNumber: day,
            dayLetter: '',
            isWeekend: false,
            isHoliday: false,
            isToday: false,
            events: [],
            isValid: false
          });
        }
      }

      this.months.push({
        date: monthDate,
        name: format(monthDate, 'MMMM', { locale: fr }),
        year: monthDate.getFullYear(),
        cells
      });
    }
  }

  getEventsForDay(dateStr: string): Event[] {
    if (!this.events) return [];
    return this.events.filter(event => {
      if (event.endDate) {
        return dateStr >= event.date && dateStr <= event.endDate;
      }
      return event.date === dateStr;
    });
  }

  prevSemester() {
    this.currentDate = subMonths(this.currentDate, 6);
    this.updateView();
  }

  nextSemester() {
    this.currentDate = addMonths(this.currentDate, 6);
    this.updateView();
  }

  goToToday() {
    this.currentDate = new Date();
    this.updateView();
  }

  onCellClick(cell: DayCell) {
    if (!cell.isValid) return;
    // Open add modal if clicked on empty space (not propagated from event)
    const dateStr = format(cell.date, 'yyyy-MM-dd');
    this.addEventClick.emit(dateStr);
  }

  onEventClick(e: MouseEvent, event: Event) {
    e.stopPropagation(); // Prevent cell click
    this.eventClick.emit(event);
  }

  getBgClass(cell: DayCell): string {
    if (cell.isToday) return '';
    if (cell.isHoliday) return '';
    if (cell.isWeekend) return 'bg-slate-50/50 dark:bg-slate-800/30';
    return 'hover:bg-gray-50 dark:hover:bg-gray-700/50';
  }

  // Copied helper from calendar-view
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

    // Simple Easter calc or reuse existing logic
    // For brevity reusing a simplified check or the full one if needed.
    // Let's use the full one to be consistent.
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
}
