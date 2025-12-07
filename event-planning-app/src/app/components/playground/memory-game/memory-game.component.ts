import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameState, LeaderboardEntry } from '@models/game.model';
import { PlaygroundService } from '@services/playground.service';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';

interface MemoryCard {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

@Component({
  selector: 'app-memory-game',
  standalone: true,
  imports: [CommonModule, LeaderboardComponent],
  template: `
    <div class="memory-game-container" [class.playing]="gameState === 'playing'">
      <div class="background-gradient" [class.active]="gameState === 'playing'"></div>

      <!-- Header -->
      <div class="game-header">
        <button (click)="goBack()" class="back-button">
          <span class="material-icons">arrow_back</span>
          Retour
        </button>
        <div class="game-title">
          <span class="material-icons text-3xl text-purple-500">psychology</span>
          <h1>Memory Game</h1>
        </div>
        <div class="game-badge">Trouvez les paires !</div>
      </div>

      <!-- Main content -->
      <div class="game-content">
        <!-- Left: Game Area -->
        <div class="game-area">
          <!-- Idle State -->
          @if (gameState === 'idle') {
            <div class="idle-state">
              <div class="game-intro">
                <div class="intro-icon">
                  <span class="material-icons">psychology</span>
                </div>
                <h2>Testez votre mémoire !</h2>
                <p>
                  Trouvez toutes les paires de cartes le plus rapidement possible.
                  Moins vous faites d'erreurs, meilleur est votre score !
                </p>

                @if (personalBest > 0) {
                  <div class="personal-best">
                    <span class="material-icons text-amber-500">emoji_events</span>
                    <span>Votre record: <strong>{{ personalBest }} pts</strong></span>
                  </div>
                }
              </div>

              <button
                (click)="startCountdown()"
                class="start-button"
                [disabled]="!currentUser"
              >
                <span class="material-icons">play_arrow</span>
                Commencer
              </button>

              @if (!currentUser) {
                <p class="login-hint">Connectez-vous pour jouer et sauvegarder vos scores</p>
              }
            </div>
          }

          <!-- Countdown State -->
          @if (gameState === 'countdown') {
            <div class="countdown-state">
              <div class="countdown-number">{{ countdown }}</div>
              <p>Mémorisez les positions...</p>
            </div>
          }

          <!-- Playing State -->
          @if (gameState === 'playing') {
            <div class="playing-state">
              <!-- Stats Bar -->
              <div class="stats-bar">
                <div class="stat-item">
                  <span class="material-icons text-purple-500">timer</span>
                  <span class="stat-value">{{ formatTime(elapsedTime) }}</span>
                  <span class="stat-label">Temps</span>
                </div>
                <div class="stat-item">
                  <span class="material-icons text-blue-500">touch_app</span>
                  <span class="stat-value">{{ moves }}</span>
                  <span class="stat-label">Coups</span>
                </div>
                <div class="stat-item">
                  <span class="material-icons text-green-500">check_circle</span>
                  <span class="stat-value">{{ matchedPairs }}/{{ totalPairs }}</span>
                  <span class="stat-label">Paires</span>
                </div>
              </div>

              <!-- Card Grid -->
              <div class="card-grid">
                @for (card of cards; track card.id) {
                  <div
                    class="memory-card"
                    [class.flipped]="card.isFlipped || card.isMatched"
                    [class.matched]="card.isMatched"
                    (click)="flipCard(card)"
                  >
                    <div class="card-inner">
                      <div class="card-front">
                        <span class="material-icons">help_outline</span>
                      </div>
                      <div class="card-back">
                        <span class="material-icons">{{ card.icon }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Finished State -->
          @if (gameState === 'finished') {
            <div class="finished-state">
              <div class="result-header">
                <div class="trophy-animation">
                  @if (newRank && newRank <= 3) {
                    <span class="material-icons trophy gold">emoji_events</span>
                  } @else if (newRank && newRank <= 10) {
                    <span class="material-icons trophy silver">emoji_events</span>
                  } @else {
                    <span class="material-icons trophy">flag</span>
                  }
                </div>
                <h2>Bravo !</h2>
              </div>

              <div class="results-grid">
                <div class="result-card main">
                  <span class="result-value">{{ finalScore }}</span>
                  <span class="result-label">Score</span>
                </div>
                <div class="result-card">
                  <span class="result-value">{{ formatTime(elapsedTime) }}</span>
                  <span class="result-label">Temps</span>
                </div>
                <div class="result-card">
                  <span class="result-value">{{ moves }}</span>
                  <span class="result-label">Coups</span>
                </div>
                <div class="result-card">
                  <span class="result-value">{{ accuracy }}%</span>
                  <span class="result-label">Efficacité</span>
                </div>
              </div>

              @if (newRank && newRank <= 10) {
                <div class="rank-announcement" [class.top3]="newRank <= 3">
                  <span class="material-icons">{{ newRank <= 3 ? 'celebration' : 'stars' }}</span>
                  <span>{{ newRank <= 3 ? 'Incroyable ! Vous êtes' : 'Bravo ! Top' }} #{{ newRank }} !</span>
                </div>
              }

              @if (isNewPersonalBest) {
                <div class="personal-best-announcement">
                  <span class="material-icons">auto_awesome</span>
                  <span>Nouveau record personnel !</span>
                </div>
              }

              <div class="action-buttons">
                <button (click)="startCountdown()" class="play-again-button">
                  <span class="material-icons">replay</span>
                  Rejouer
                </button>
                <button (click)="goBack()" class="back-to-menu-button">
                  <span class="material-icons">home</span>
                  Menu
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Right: Leaderboard -->
        <div class="leaderboard-section">
          <app-leaderboard
            [entries]="leaderboard"
            [isLoading]="isLoadingLeaderboard"
            [newEntryId]="highlightedEntryId"
            [scoreUnit]="'pts'"
            [showWpm]="false"
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .memory-game-container {
      @apply min-h-screen p-6 relative overflow-hidden;
    }

    .background-gradient {
      @apply absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none;
      background: linear-gradient(-45deg, #8b5cf6, #7c3aed, #6d28d9, #5b21b6);
      background-size: 400% 400%;
    }

    .background-gradient.active {
      @apply opacity-10;
      animation: gradientShift 3s ease infinite;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .game-header {
      @apply flex items-center justify-between mb-6 relative z-10;
    }

    .back-button {
      @apply flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all;
    }

    .game-title {
      @apply flex items-center gap-3;
    }

    .game-title h1 {
      @apply text-2xl font-bold text-gray-900 dark:text-white;
    }

    .game-badge {
      @apply px-4 py-2 rounded-full font-medium text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300;
    }

    .game-content {
      @apply flex gap-6 relative z-10;
    }

    .game-area {
      @apply flex-1 min-h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center;
    }

    .leaderboard-section {
      @apply w-96 flex-shrink-0;
    }

    /* Idle State */
    .idle-state {
      @apply flex flex-col items-center text-center;
    }

    .game-intro {
      @apply mb-8;
    }

    .intro-icon {
      @apply relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6;
    }

    .intro-icon .material-icons {
      @apply text-5xl text-purple-600 dark:text-purple-400;
    }

    .game-intro h2 {
      @apply text-3xl font-bold text-gray-900 dark:text-white mb-4;
    }

    .game-intro p {
      @apply text-gray-600 dark:text-gray-400 max-w-md;
    }

    .personal-best {
      @apply flex items-center gap-2 mt-6 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-full text-amber-700 dark:text-amber-400;
    }

    .start-button {
      @apply flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed;
    }

    .login-hint {
      @apply mt-4 text-sm text-gray-500 dark:text-gray-400;
    }

    /* Countdown State */
    .countdown-state {
      @apply flex flex-col items-center;
    }

    .countdown-number {
      @apply text-9xl font-black text-purple-600 dark:text-purple-400;
      animation: countdownPop 1s ease-out;
    }

    @keyframes countdownPop {
      0% { transform: scale(0.5); opacity: 0; }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }

    /* Playing State */
    .playing-state {
      @apply w-full flex flex-col items-center;
    }

    .stats-bar {
      @apply flex items-center justify-center gap-8 mb-8;
    }

    .stat-item {
      @apply flex flex-col items-center;
    }

    .stat-value {
      @apply text-2xl font-bold text-gray-900 dark:text-white;
    }

    .stat-label {
      @apply text-sm text-gray-500 dark:text-gray-400;
    }

    /* Card Grid */
    .card-grid {
      @apply grid grid-cols-4 gap-3 max-w-md;
    }

    .memory-card {
      @apply w-20 h-20 cursor-pointer perspective-1000;
    }

    .card-inner {
      @apply relative w-full h-full transition-transform duration-500 transform-style-preserve-3d;
    }

    .memory-card.flipped .card-inner {
      transform: rotateY(180deg);
    }

    .card-front, .card-back {
      @apply absolute w-full h-full rounded-xl flex items-center justify-center backface-hidden;
    }

    .card-front {
      @apply bg-gradient-to-br from-purple-500 to-purple-600 text-white;
    }

    .card-front .material-icons {
      @apply text-3xl opacity-50;
    }

    .card-back {
      @apply bg-white dark:bg-gray-700 border-2 border-purple-300 dark:border-purple-600;
      transform: rotateY(180deg);
    }

    .card-back .material-icons {
      @apply text-3xl text-purple-600 dark:text-purple-400;
    }

    .memory-card.matched .card-back {
      @apply bg-green-100 dark:bg-green-900/30 border-green-400;
    }

    .memory-card.matched .card-back .material-icons {
      @apply text-green-600 dark:text-green-400;
    }

    /* Finished State */
    .finished-state {
      @apply flex flex-col items-center text-center;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .result-header {
      @apply mb-8;
    }

    .trophy-animation {
      @apply mb-4;
    }

    .trophy {
      @apply text-7xl text-gray-400;
      animation: trophyBounce 0.6s ease-out;
    }

    .trophy.gold {
      @apply text-amber-500;
    }

    .trophy.silver {
      @apply text-gray-400;
    }

    @keyframes trophyBounce {
      0% { transform: scale(0) rotate(-20deg); }
      60% { transform: scale(1.2) rotate(10deg); }
      100% { transform: scale(1) rotate(0); }
    }

    .result-header h2 {
      @apply text-3xl font-bold text-gray-900 dark:text-white;
    }

    .results-grid {
      @apply grid grid-cols-2 gap-4 mb-6;
    }

    .result-card {
      @apply p-6 bg-gray-100 dark:bg-gray-700 rounded-2xl;
    }

    .result-card.main {
      @apply col-span-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white;
    }

    .result-value {
      @apply block text-4xl font-bold text-gray-900 dark:text-white;
    }

    .result-card.main .result-value {
      @apply text-white text-6xl;
    }

    .result-label {
      @apply text-sm text-gray-500 dark:text-gray-400 mt-1;
    }

    .result-card.main .result-label {
      @apply text-purple-100;
    }

    .rank-announcement {
      @apply flex items-center gap-2 px-6 py-3 rounded-full font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-500 text-white;
      animation: slideIn 0.5s ease-out 0.3s both;
    }

    .rank-announcement.top3 {
      @apply from-amber-400 to-amber-500;
    }

    .personal-best-announcement {
      @apply flex items-center gap-2 px-6 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-bold mb-6;
      animation: slideIn 0.5s ease-out 0.4s both;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .action-buttons {
      @apply flex gap-4;
    }

    .play-again-button {
      @apply flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all;
    }

    .back-to-menu-button {
      @apply flex items-center gap-2 px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all;
    }

    /* Utilities */
    .perspective-1000 {
      perspective: 1000px;
    }

    .transform-style-preserve-3d {
      transform-style: preserve-3d;
    }

    .backface-hidden {
      backface-visibility: hidden;
    }

    /* Responsive */
    @media (max-width: 1280px) {
      .game-content {
        @apply flex-col;
      }

      .leaderboard-section {
        @apply w-full;
      }
    }

    @media (max-width: 640px) {
      .memory-card {
        @apply w-16 h-16;
      }

      .card-front .material-icons,
      .card-back .material-icons {
        @apply text-2xl;
      }
    }
  `]
})
export class MemoryGameComponent implements OnInit, OnDestroy {
  gameState: GameState = 'idle';
  countdown = 3;

  // Game state
  cards: MemoryCard[] = [];
  flippedCards: MemoryCard[] = [];
  moves = 0;
  matchedPairs = 0;
  totalPairs = 8;
  elapsedTime = 0;
  isProcessing = false;

  // Results
  finalScore = 0;
  accuracy = 0;

  // Leaderboard
  leaderboard: LeaderboardEntry[] = [];
  isLoadingLeaderboard = false;
  highlightedEntryId: string | null = null;
  personalBest = 0;
  newRank: number | null = null;
  isNewPersonalBest = false;

  currentUser: { id: string; firstName: string; lastName: string } | null = null;

  private gameTimer: ReturnType<typeof setInterval> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  // Icons for memory cards
  private icons = [
    'star', 'favorite', 'bolt', 'diamond',
    'rocket', 'music_note', 'pets', 'eco',
    'local_fire', 'anchor', 'cake', 'palette'
  ];

  constructor(
    private router: Router,
    private playgroundService: PlaygroundService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadPersonalBest();
      }
    });

    this.loadLeaderboard();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  async loadLeaderboard(): Promise<void> {
    this.isLoadingLeaderboard = true;
    try {
      this.leaderboard = await this.playgroundService.getLeaderboard('memory-game');
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      this.isLoadingLeaderboard = false;
    }
  }

  async loadPersonalBest(): Promise<void> {
    try {
      const myScores = await this.playgroundService.getMyScores('memory-game');
      this.personalBest = myScores.bestScore;
    } catch (error) {
      console.error('Error loading personal best:', error);
    }
  }

  initializeCards(): void {
    // Select random icons for this game
    const selectedIcons = this.shuffleArray([...this.icons]).slice(0, this.totalPairs);

    // Create pairs
    const cardPairs: MemoryCard[] = [];
    selectedIcons.forEach((icon, index) => {
      cardPairs.push(
        { id: index * 2, icon, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, icon, isFlipped: false, isMatched: false }
      );
    });

    // Shuffle cards
    this.cards = this.shuffleArray(cardPairs);
  }

  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  startCountdown(): void {
    this.gameState = 'countdown';
    this.countdown = 3;
    this.resetGame();
    this.initializeCards();

    this.countdownTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.clearTimers();
        this.startGame();
      }
    }, 1000);
  }

  startGame(): void {
    this.gameState = 'playing';
    this.elapsedTime = 0;

    this.gameTimer = setInterval(() => {
      this.elapsedTime++;
    }, 1000);
  }

  flipCard(card: MemoryCard): void {
    if (
      this.isProcessing ||
      card.isFlipped ||
      card.isMatched ||
      this.flippedCards.length >= 2
    ) {
      return;
    }

    card.isFlipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.moves++;
      this.checkMatch();
    }
  }

  checkMatch(): void {
    this.isProcessing = true;
    const [card1, card2] = this.flippedCards;

    if (card1.icon === card2.icon) {
      // Match found!
      card1.isMatched = true;
      card2.isMatched = true;
      this.matchedPairs++;
      this.flippedCards = [];
      this.isProcessing = false;

      if (this.matchedPairs === this.totalPairs) {
        this.endGame();
      }
    } else {
      // No match - flip back after delay
      setTimeout(() => {
        card1.isFlipped = false;
        card2.isFlipped = false;
        this.flippedCards = [];
        this.isProcessing = false;
      }, 1000);
    }
  }

  async endGame(): Promise<void> {
    this.clearTimers();
    this.gameState = 'finished';

    // Calculate score: base points - time penalty - move penalty
    // Perfect game with 8 pairs = 16 moves minimum
    const perfectMoves = this.totalPairs * 2;
    const extraMoves = Math.max(0, this.moves - perfectMoves);
    this.accuracy = Math.round((perfectMoves / this.moves) * 100);

    // Score calculation: 1000 base, minus 10 per second, minus 20 per extra move
    this.finalScore = Math.max(0, 1000 - (this.elapsedTime * 5) - (extraMoves * 20));

    // Submit score
    try {
      const response = await this.playgroundService.submitScore(
        'memory-game',
        this.finalScore,
        0, // WPM not applicable
        this.accuracy,
        { time: this.elapsedTime, moves: this.moves }
      );

      this.newRank = response.rank <= 10 ? response.rank : null;
      this.isNewPersonalBest = response.isNewPersonalBest;

      if (this.isNewPersonalBest) {
        this.personalBest = this.finalScore;
      }

      await this.loadLeaderboard();

      if (this.newRank && this.newRank <= 10) {
        const userEntry = this.leaderboard.find(e => e.userId === this.currentUser?.id);
        if (userEntry) {
          this.highlightedEntryId = userEntry.id;
        }
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      this.toastService.error('Erreur', 'Impossible de sauvegarder le score');
    }
  }

  resetGame(): void {
    this.cards = [];
    this.flippedCards = [];
    this.moves = 0;
    this.matchedPairs = 0;
    this.elapsedTime = 0;
    this.isProcessing = false;
    this.finalScore = 0;
    this.accuracy = 0;
    this.newRank = null;
    this.isNewPersonalBest = false;
    this.highlightedEntryId = null;
  }

  clearTimers(): void {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  goBack(): void {
    this.router.navigate(['/playground']);
  }
}
