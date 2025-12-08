import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TimelineView, TimelineState } from '@models/timeline.model';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {
  private stateSubject = new BehaviorSubject<TimelineState>({
    view: 'now',
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
    // Vue trimestrielle : avancer de 3 mois
    const newDate = new Date(current.getFullYear(), current.getMonth() + 3, 1);
    this.setCurrentDate(newDate);
  }

  previousPeriod(): void {
    const state = this.stateSubject.value;
    const current = state.currentDate;
    // Vue trimestrielle : reculer de 3 mois
    const newDate = new Date(current.getFullYear(), current.getMonth() - 3, 1);
    this.setCurrentDate(newDate);
  }

  goToToday(): void {
    this.setCurrentDate(new Date());
    // Émettre un événement pour déclencher le scroll
    this.scrollToTodaySubject.next();
  }

  private scrollToTodaySubject = new Subject<void>();
  public scrollToToday$ = this.scrollToTodaySubject.asObservable();

  getYearMonths(year: number): Date[] {
    return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  }

  getCurrentState(): TimelineState {
    return this.stateSubject.value;
  }
}
