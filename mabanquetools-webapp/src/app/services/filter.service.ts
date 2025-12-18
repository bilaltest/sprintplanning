import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, debounceTime, distinctUntilChanged } from 'rxjs';
import { Event, EventCategory } from '@models/event.model';
import { EventFilter, DEFAULT_FILTER } from '@models/filter.model';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filterSubject = new BehaviorSubject<EventFilter>(DEFAULT_FILTER);
  public filter$: Observable<EventFilter> = this.filterSubject.asObservable();

  public filteredEvents$: Observable<Event[]>;

  constructor(private eventService: EventService) {
    this.filteredEvents$ = combineLatest([
      this.eventService.events$,
      this.filter$.pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
    ]).pipe(
      map(([events, filter]) => this.applyFilters(events, filter))
    );
  }

  private applyFilters(events: Event[], filter: EventFilter): Event[] {
    let filtered = [...events];

    // Filter by categories
    if (filter.categories.length > 0) {
      filtered = filtered.filter(event =>
        filter.categories.includes(event.category)
      );
    }

    return filtered;
  }

  setFilter(filter: Partial<EventFilter>): void {
    const currentFilter = this.filterSubject.value;
    this.filterSubject.next({ ...currentFilter, ...filter });
  }

  setCategoryFilter(categories: EventCategory[]): void {
    this.setFilter({ categories });
  }

  toggleCategory(category: EventCategory): void {
    const currentFilter = this.filterSubject.value;
    const categories = [...currentFilter.categories];
    const index = categories.indexOf(category);

    if (index > -1) {
      categories.splice(index, 1);
    } else {
      categories.push(category);
    }

    this.setCategoryFilter(categories);
  }

  resetFilters(): void {
    this.filterSubject.next(DEFAULT_FILTER);
  }

  getCurrentFilter(): EventFilter {
    return this.filterSubject.value;
  }

  hasActiveFilters(): boolean {
    const filter = this.filterSubject.value;
    return filter.categories.length > 0;
  }
}
