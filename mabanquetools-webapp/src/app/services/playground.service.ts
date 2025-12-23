import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import {
  Game,
  LeaderboardEntry,
  MyScoresResponse,
  SubmitScoreResponse
} from '@models/game.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {
  private apiUrl = `${environment.apiUrl}/games`;
  private readonly STORAGE_KEY = 'planning_auth_token';

  private gamesSubject = new BehaviorSubject<Game[]>([]);
  public games$: Observable<Game[]> = this.gamesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initGames();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.STORAGE_KEY);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  private async initGames(): Promise<void> {
    try {
      // Initialiser les jeux par défaut s'ils n'existent pas
      await firstValueFrom(this.http.post<Game[]>(`${this.apiUrl}/init`, {}));
      await this.loadGames();
    } catch (error) {
      console.error('Error initializing games:', error);
      await this.loadGames();
    }
  }

  private async loadGames(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      const games = await firstValueFrom(this.http.get<Game[]>(this.apiUrl));
      this.gamesSubject.next(games);
    } catch (error) {
      console.error('Error loading games:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async getGameBySlug(slug: string): Promise<Game> {
    return firstValueFrom(this.http.get<Game>(`${this.apiUrl}/${slug}`));
  }

  async getLeaderboard(slug: string): Promise<LeaderboardEntry[]> {
    return firstValueFrom(
      this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/${slug}/leaderboard`)
    );
  }

  async submitScore(
    slug: string,
    score: number,
    wpm: number,
    accuracy: number,
    metadata?: Record<string, unknown>
  ): Promise<SubmitScoreResponse> {
    return firstValueFrom(
      this.http.post<SubmitScoreResponse>(
        `${this.apiUrl}/${slug}/scores`,
        { score, wpm, accuracy, metadata },
        { headers: this.getAuthHeaders() }
      )
    );
  }

  async getMyScores(slug: string): Promise<MyScoresResponse> {
    return firstValueFrom(
      this.http.get<MyScoresResponse>(
        `${this.apiUrl}/${slug}/my-scores`,
        { headers: this.getAuthHeaders() }
      )
    );
  }

  async refreshGames(): Promise<void> {
    await this.loadGames();
  }
}
