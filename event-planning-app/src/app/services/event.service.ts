import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
      throw error;
    }
  }

  async exportEvents(): Promise<Event[]> {
    return firstValueFrom(this.http.get<Event[]>(this.apiUrl));
  }
}
