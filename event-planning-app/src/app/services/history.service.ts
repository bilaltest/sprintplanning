import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HistoryEntry } from '@models/history.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/history`;

  private historySubject = new BehaviorSubject<HistoryEntry[]>([]);
  public history$: Observable<HistoryEntry[]> = this.historySubject.asObservable();

  private refreshIntervalId?: number;

  constructor(private http: HttpClient) {
    this.loadHistory();
    // Rafraîchir automatiquement toutes les 2 secondes
    this.startAutoRefresh();
  }

  // Cleanup automatique lors de la destruction du service
  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  private async loadHistory(): Promise<void> {
    try {
      const entries = await firstValueFrom(
        this.http.get<HistoryEntry[]>(this.apiUrl)
      );
      this.historySubject.next(entries);
    } catch (error) {
      // Erreur silencieuse - l'historique ne se chargera pas
    }
  }

  async rollback(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/${id}/rollback`, {})
      );
      await this.loadHistory();
    } catch (error) {
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
      throw error;
    }
  }

  // Rafraîchir l'historique
  async refresh(): Promise<void> {
    await this.loadHistory();
  }

  // Démarrer le rafraîchissement automatique
  private startAutoRefresh(): void {
    this.refreshIntervalId = window.setInterval(() => {
      this.loadHistory();
    }, 2000); // Rafraîchir toutes les 2 secondes
  }

  // Arrêter le rafraîchissement automatique (utile pour ngOnDestroy)
  stopAutoRefresh(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = undefined;
    }
  }
}
