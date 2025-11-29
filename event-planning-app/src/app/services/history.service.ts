import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HistoryEntry } from '@models/history.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/history`;

  private historySubject = new BehaviorSubject<HistoryEntry[]>([]);
  public history$: Observable<HistoryEntry[]> = this.historySubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadHistory();
  }

  private async loadHistory(): Promise<void> {
    try {
      const entries = await firstValueFrom(
        this.http.get<HistoryEntry[]>(this.apiUrl)
      );
      this.historySubject.next(entries);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }

  async rollback(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/${id}/rollback`, {})
      );
      await this.loadHistory();
    } catch (error) {
      console.error('Error rolling back:', error);
      throw error;
    }
  }

  async clearHistory(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(this.apiUrl)
      );
      await this.loadHistory();
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }

  // Rafraîchir l'historique
  async refresh(): Promise<void> {
    await this.loadHistory();
  }
}
