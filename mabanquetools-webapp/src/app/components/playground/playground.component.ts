import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Game, LeaderboardEntry } from '@models/game.model';
import { PlaygroundService } from '@services/playground.service';
import { AuthService } from '@services/auth.service';

interface GameCard extends Game {
  leaderboard?: LeaderboardEntry[];
  isLoadingLeaderboard?: boolean;
  gradient: string;
  hoverGradient: string;
}

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="playground-container">
      <!-- Header -->
      <div class="playground-header">
        <div class="header-content">
          <div class="header-icon">
            <span class="material-icons">sports_esports</span>
          </div>
          <div class="header-text">
            <h1>Playground</h1>
            <p>Détendez-vous et défiez vos collègues !</p>
          </div>
        </div>

        @if (currentUser) {
          <div class="user-welcome">
            <span class="material-icons">waving_hand</span>
            <span>Bienvenue, <strong>{{ currentUser.firstName }}</strong></span>
          </div>
        }
      </div>

      <!-- Games Grid -->
      <div class="games-section">
        <h2 class="section-title">
          <span class="material-icons">videogame_asset</span>
          Jeux disponibles
        </h2>

        <div class="games-grid">
          @for (game of gameCards; track game.id) {
            <div
              class="game-card"
              [style.--gradient]="game.gradient"
              [style.--hover-gradient]="game.hoverGradient"
              (click)="playGame(game)"
            >
              <div class="card-glow"></div>
              <div class="card-content">
                <div class="game-icon">
                  <span class="material-icons">{{ game.icon }}</span>
                </div>

                <div class="game-info">
                  <h3>{{ game.name }}</h3>
                  <p>{{ game.description }}</p>
                </div>

                <div *ngIf="game.slug === 'typing-fr' || game.slug === 'typing-en'" class="game-badge" [class.french]="game.slug === 'typing-fr'" [class.english]="game.slug === 'typing-en'">
                  {{ game.slug === 'typing-fr' ? '🇫🇷' : '🇬🇧' }}
                </div>

                <!-- Mini Leaderboard Preview -->
                <div class="mini-leaderboard">
                  <div class="mini-header">
                    <span class="material-icons text-amber-500">emoji_events</span>
                    <span>Top 3</span>
                  </div>

                  @if (game.isLoadingLeaderboard) {
                    <div class="mini-loading">
                      <div class="loading-dot"></div>
                      <div class="loading-dot"></div>
                      <div class="loading-dot"></div>
                    </div>
                  } @else if (game.leaderboard && game.leaderboard.length > 0) {
                    <div class="mini-entries">
                      @for (entry of game.leaderboard.slice(0, 3); track entry.id; let i = $index) {
                        <div class="mini-entry" [class.gold]="i === 0" [class.silver]="i === 1" [class.bronze]="i === 2">
                          <span class="mini-rank">{{ i + 1 }}</span>
                          <span class="mini-name">{{ getDisplayName(entry) }}</span>
                          <span class="mini-score">{{ entry.score }}</span>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="mini-empty">
                      <span>Aucun score</span>
                      <span class="text-xs">Soyez le premier !</span>
                    </div>
                  }
                </div>

                <button class="play-button">
                  <span class="material-icons">play_arrow</span>
                  Jouer
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Coming Soon Section -->
      <div class="coming-soon-section">
        <h2 class="section-title">
          <span class="material-icons">upcoming</span>
          Prochainement
        </h2>

        <div class="coming-soon-grid">
          <div class="coming-soon-card">
            <div class="coming-icon">
              <span class="material-icons">quiz</span>
            </div>
            <h4>Quiz ?</h4>
            <span class="soon-badge">Bientôt</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .playground-container {
      @apply p-6 max-w-7xl mx-auto;
    }

    /* Header */
    .playground-header {
      @apply flex items-center justify-between mb-10;
    }

    .header-content {
      @apply flex items-center gap-5;
    }

    .header-icon {
      @apply w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg;
      animation: float 3s ease-in-out infinite;
    }

    .header-icon .material-icons {
      @apply text-4xl text-white;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .header-text h1 {
      @apply text-4xl font-black text-gray-900 dark:text-white;
    }

    .header-text p {
      @apply text-gray-600 dark:text-gray-400 text-lg mt-1;
    }

    .user-welcome {
      @apply flex items-center gap-2 px-5 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-700 dark:text-primary-300;
    }

    /* Section Titles */
    .section-title {
      @apply flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-6;
    }

    .section-title .material-icons {
      @apply text-primary-500;
    }

    /* Games Grid */
    .games-section {
      @apply mb-12;
    }

    .games-grid {
      @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
    }

    .game-card {
      @apply relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500;
      background: var(--gradient);
      min-height: 240px;
    }

    .game-card:hover {
      @apply transform -translate-y-1 shadow-xl;
      background: var(--hover-gradient);
    }

    .game-card:hover .card-glow {
      @apply opacity-100;
    }

    .game-card:hover .play-button {
      @apply scale-105;
    }

    .card-glow {
      @apply absolute inset-0 opacity-0 transition-opacity duration-500;
      background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%);
    }

    .card-content {
      @apply relative z-10 p-4 h-full flex flex-col;
    }

    .game-icon {
      @apply w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2;
    }

    .game-icon .material-icons {
      @apply text-2xl text-white;
    }

    .game-info h3 {
      @apply text-base font-bold text-white mb-1;
    }

    .game-info p {
      @apply text-white/80 text-xs line-clamp-2;
    }

    .game-badge {
      @apply absolute top-3 right-3 text-lg;
    }

    /* Mini Leaderboard */
    .mini-leaderboard {
      @apply mt-auto pt-3 border-t border-white/20;
    }

    .mini-header {
      @apply flex items-center gap-1 text-xs font-semibold text-white/90 mb-2;
    }

    .mini-header .material-icons {
      @apply text-sm;
    }

    .mini-loading {
      @apply flex gap-1 justify-center py-1;
    }

    .loading-dot {
      @apply w-1.5 h-1.5 rounded-full bg-white/50;
      animation: loadingPulse 1s ease-in-out infinite;
    }

    .loading-dot:nth-child(2) { animation-delay: 0.2s; }
    .loading-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes loadingPulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    .mini-entries {
      @apply flex flex-col gap-0.5;
    }

    .mini-entry {
      @apply flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 text-white text-xs;
    }

    .mini-entry.gold { @apply bg-amber-500/30; }
    .mini-entry.silver { @apply bg-gray-400/30; }
    .mini-entry.bronze { @apply bg-orange-500/30; }

    .mini-rank {
      @apply w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold;
    }

    .mini-entry.gold .mini-rank { @apply bg-amber-400 text-amber-900; }
    .mini-entry.silver .mini-rank { @apply bg-gray-300 text-gray-700; }
    .mini-entry.bronze .mini-rank { @apply bg-orange-400 text-orange-900; }

    .mini-name {
      @apply flex-1 truncate text-xs;
    }

    .mini-score {
      @apply font-bold text-xs;
    }

    .mini-empty {
      @apply flex flex-col items-center py-2 text-white/60 text-xs;
    }

    .play-button {
      @apply mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-bold transition-all hover:bg-white/30;
    }

    /* Coming Soon Section */
    .coming-soon-section {
      @apply opacity-80;
    }

    .coming-soon-grid {
      @apply grid grid-cols-2 sm:grid-cols-4 gap-3;
    }

    .coming-soon-card {
      @apply relative p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center;
    }

    .coming-icon {
      @apply w-10 h-10 mx-auto mb-2 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center;
    }

    .coming-icon .material-icons {
      @apply text-2xl text-gray-400 dark:text-gray-500;
    }

    .coming-soon-card h4 {
      @apply text-sm font-bold text-gray-700 dark:text-gray-300 mb-0.5;
    }

    .coming-soon-card p {
      @apply text-xs text-gray-500 dark:text-gray-400;
    }

    .soon-badge {
      @apply absolute top-2 right-2 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-medium rounded-full;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .playground-header {
        @apply flex-col gap-4 text-center;
      }

      .header-content {
        @apply flex-col;
      }

      .game-card {
        min-height: 220px;
      }
    }
  `]
})
export class PlaygroundComponent implements OnInit {
  gameCards: GameCard[] = [];
  currentUser: { id: string; firstName: string; lastName: string } | null = null;

  private gradients: Record<string, { gradient: string; hoverGradient: string }> = {
    'typing-fr': {
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      hoverGradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)'
    },
    'typing-en': {
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
      hoverGradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)'
    },
    'color-chaos': {
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)',
      hoverGradient: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #fbbf24 100%)'
    },
    'memory-game': {
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
      hoverGradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)'
    },
    'math-rush': {
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      hoverGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
    },
    'flappy-dsi': {
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
      hoverGradient: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)'
    }
  };

  private defaultGradient = {
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)',
    hoverGradient: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 50%, #4b5563 100%)'
  };

  constructor(
    private router: Router,
    private playgroundService: PlaygroundService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadGames();
  }

  async loadGames(): Promise<void> {
    this.playgroundService.games$.subscribe(async games => {
      this.gameCards = games.map(game => ({
        ...game,
        gradient: this.gradients[game.slug]?.gradient || this.defaultGradient.gradient,
        hoverGradient: this.gradients[game.slug]?.hoverGradient || this.defaultGradient.hoverGradient,
        isLoadingLeaderboard: true
      }));

      // Load leaderboards for each game
      for (const card of this.gameCards) {
        try {
          card.leaderboard = await this.playgroundService.getLeaderboard(card.slug);
        } catch (error) {
          console.error(`Error loading leaderboard for ${card.slug}:`, error);
          card.leaderboard = [];
        } finally {
          card.isLoadingLeaderboard = false;
        }
      }
    });
  }

  playGame(game: GameCard): void {
    this.router.navigate(['/playground', game.slug]);
  }

  getDisplayName(entry: LeaderboardEntry): string {
    if (entry.user) {
      return `${entry.user.firstName} ${entry.user.lastName.charAt(0)}.`;
    }
    return entry.visitorName || 'Anonyme';
  }
}
