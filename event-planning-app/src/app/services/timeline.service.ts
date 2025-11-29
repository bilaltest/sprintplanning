import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TimelineView, TimelineState, MonthData, WeekData } from '@models/timeline.model';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, getDay, getDaysInMonth, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {
  private stateSubject = new BehaviorSubject<TimelineState>({
    view: 'annual',
    currentDate: new Date()
  });

  public state$: Observable<TimelineState> = this.stateSubject.asObservable();

  setView(view: TimelineView): void {
    const current = this.stateSubject.value;
    this.stateSubject.next({ ...current, view });
  }

  setCurrentDate(date: Date): void {
    const current = this.stateSubject.value;
    this.stateSubject.next({ ...current, currentDate: date });
  }

  selectDate(date: Date): void {
    const current = this.stateSubject.value;
    this.stateSubject.next({ ...current, selectedDate: date });
  }

  nextPeriod(): void {
    const state = this.stateSubject.value;
    const current = state.currentDate;
    let newDate: Date;

    switch (state.view) {
      case 'annual':
        // Vue annuelle : changer d'année (rester sur janvier pour cohérence)
        newDate = new Date(current.getFullYear() + 1, 0, 1);
        break;
      case 'month':
        newDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        break;
    }

    this.setCurrentDate(newDate);
  }

  previousPeriod(): void {
    const state = this.stateSubject.value;
    const current = state.currentDate;
    let newDate: Date;

    switch (state.view) {
      case 'annual':
        // Vue annuelle : changer d'année (rester sur janvier pour cohérence)
        newDate = new Date(current.getFullYear() - 1, 0, 1);
        break;
      case 'month':
        newDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
        break;
    }

    this.setCurrentDate(newDate);
  }

  goToToday(): void {
    this.setCurrentDate(new Date());
    // Émettre un événement pour déclencher le scroll
    this.scrollToTodaySubject.next();
  }

  private scrollToTodaySubject = new Subject<void>();
  public scrollToToday$ = this.scrollToTodaySubject.asObservable();

  getMonthData(date: Date, locale: 'fr' | 'en' = 'fr'): MonthData {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = getDaysInMonth(firstDay);
    const firstDayOfWeek = getDay(firstDay);

    return {
      year,
      month,
      name: format(firstDay, 'MMMM', { locale: locale === 'fr' ? fr : enUS }),
      days: daysInMonth,
      firstDayOfWeek
    };
  }

  getWeeksInMonth(date: Date, weekStartsOnMonday: boolean = true): WeekData[] {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });

    const weeks: WeekData[] = [];
    let currentWeek: Date[] = [];
    let weekNumber = 1;

    days.forEach((day, index) => {
      const dayOfWeek = getDay(day);
      const isStartOfWeek = weekStartsOnMonday ? dayOfWeek === 1 : dayOfWeek === 0;

      if (isStartOfWeek && currentWeek.length > 0) {
        weeks.push({ weekNumber, days: [...currentWeek] });
        currentWeek = [];
        weekNumber++;
      }

      currentWeek.push(day);

      if (index === days.length - 1 && currentWeek.length > 0) {
        weeks.push({ weekNumber, days: [...currentWeek] });
      }
    });

    return weeks;
  }

  getYearMonths(year: number): Date[] {
    return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  }

  getCurrentState(): TimelineState {
    return this.stateSubject.value;
  }
}
