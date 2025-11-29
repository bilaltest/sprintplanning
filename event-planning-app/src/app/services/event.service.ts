import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Event } from '@models/event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$: Observable<Event[]> = this.eventsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadEvents();
  }

  private async loadEvents(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      const events = await firstValueFrom(this.http.get<Event[]>(this.apiUrl));
      this.eventsSubject.next(events);
    } catch (error) {
      console.error('Error loading events:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    try {
      const newEvent = await firstValueFrom(
        this.http.post<Event>(this.apiUrl, event)
      );
      await this.loadEvents();
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    try {
      const updatedEvent = await firstValueFrom(
        this.http.put<Event>(`${this.apiUrl}/${id}`, updates)
      );
      await this.loadEvents();
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}/${id}`)
      );
      await this.loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async duplicateEvent(id: string, newDate?: string): Promise<Event> {
    try {
      const event = await firstValueFrom(
        this.http.get<Event>(`${this.apiUrl}/${id}`)
      );

      const { id: _, createdAt, updatedAt, ...eventData } = event;
      const duplicatedEvent = await this.createEvent({
        ...eventData,
        title: `${event.title} (copie)`,
        date: newDate || event.date
      });

      return duplicatedEvent;
    } catch (error) {
      console.error('Error duplicating event:', error);
      throw error;
    }
  }

  async moveEvent(id: string, newDate: string): Promise<Event> {
    return this.updateEvent(id, { date: newDate });
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  async clearAllEvents(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(this.apiUrl)
      );
      await this.loadEvents();
    } catch (error) {
      console.error('Error clearing events:', error);
      throw error;
    }
  }

  async importEvents(events: Event[]): Promise<void> {
    try {
      this.loadingSubject.next(true);
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/bulk`, { events })
      );
      await this.loadEvents();
    } catch (error) {
      console.error('Error importing events:', error);
      throw error;
    }
  }

  async exportEvents(): Promise<Event[]> {
    return firstValueFrom(this.http.get<Event[]>(this.apiUrl));
  }

  // Méthode pour filtrer les événements (utilisée par FilterService)
  async getFilteredEvents(params: {
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<Event[]> {
    let httpParams = new HttpParams();

    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return firstValueFrom(
      this.http.get<Event[]>(this.apiUrl, { params: httpParams })
    );
  }
}
