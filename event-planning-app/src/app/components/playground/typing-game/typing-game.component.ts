import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameState, LeaderboardEntry, TypingGameResult } from '@models/game.model';
import { PlaygroundService } from '@services/playground.service';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { FRENCH_WORDS } from './words-fr';
import { ENGLISH_WORDS } from './words-en';

@Component({
  selector: 'app-typing-game',
  standalone: true,
  imports: [CommonModule, FormsModule, LeaderboardComponent],
  template: `
    <div class="typing-game-container" [class.playing]="gameState === 'playing'">
      <!-- Background gradient animation -->
      <div class="background-gradient" [class.active]="gameState === 'playing'"></div>

      <!-- Header -->
      <div class="game-header">
        <button
          (click)="goBack()"
          class="back-button"
        >
          <span class="material-icons">arrow_back</span>
          Retour
        </button>
        <div class="game-title">
          <span class="material-icons text-3xl" [class.text-blue-500]="language === 'en'" [class.text-primary-500]="language === 'fr'">
            keyboard
          </span>
          <h1>{{ language === 'fr' ? 'Typing Challenge FR' : 'Typing Challenge EN' }}</h1>
        </div>
        <div class="language-badge" [class.french]="language === 'fr'" [class.english]="language === 'en'">
          {{ language === 'fr' ? '🇫🇷 Français' : '🇬🇧 English' }}
        </div>
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
                  <span class="material-icons">timer</span>
                  <span class="time-badge">60s</span>
                </div>
                <h2>{{ language === 'fr' ? 'Prêt à taper ?' : 'Ready to type?' }}</h2>
                <p>
                  {{ language === 'fr'
                    ? 'Tapez un maximum de mots en 60 secondes. Appuyez sur Espace ou Entrée pour valider chaque mot.'
                    : 'Type as many words as you can in 60 seconds. Press Space or Enter to validate each word.'
                  }}
                </p>

                @if (personalBest > 0) {
                  <div class="personal-best">
                    <span class="material-icons text-amber-500">emoji_events</span>
                    <span>{{ language === 'fr' ? 'Votre record' : 'Your best' }}: <strong>{{ personalBest }} {{ language === 'fr' ? 'mots' : 'words' }}</strong></span>
                  </div>
                }
              </div>

              <button
                (click)="startCountdown()"
                class="start-button"
                [disabled]="!currentUser"
              >
                <span class="material-icons">play_arrow</span>
                {{ language === 'fr' ? 'Commencer' : 'Start' }}
              </button>

              @if (!currentUser) {
                <p class="login-hint">
                  {{ language === 'fr' ? 'Connectez-vous pour jouer et sauvegarder vos scores' : 'Log in to play and save your scores' }}
                </p>
              }
            </div>
          }

          <!-- Countdown State -->
          @if (gameState === 'countdown') {
            <div class="countdown-state">
              <div class="countdown-number" [class.animate]="true">
                {{ countdown }}
              </div>
              <p>{{ language === 'fr' ? 'Préparez-vous...' : 'Get ready...' }}</p>
            </div>
          }

          <!-- Playing State -->
          @if (gameState === 'playing') {
            <div class="playing-state">
              <!-- Timer & Stats Bar -->
              <div class="stats-bar">
                <div class="timer-section" [class.warning]="timeLeft <= 10" [class.critical]="timeLeft <= 5">
                  <div class="timer-circle">
                    <svg viewBox="0 0 36 36">
                      <path
                        class="timer-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        class="timer-progress"
                        [attr.stroke-dasharray]="timerProgress + ', 100'"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span class="timer-text">{{ timeLeft }}</span>
                  </div>
                </div>

                <div class="live-stats">
                  <div class="stat-item">
                    <span class="stat-value score-animate" [class.bump]="scoreBump">{{ correctWords }}</span>
                    <span class="stat-label">{{ language === 'fr' ? 'Mots' : 'Words' }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ currentWpm }}</span>
                    <span class="stat-label">WPM</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ currentAccuracy }}%</span>
                    <span class="stat-label">{{ language === 'fr' ? 'Précision' : 'Accuracy' }}</span>
                  </div>
                </div>

                @if (currentStreak >= 3) {
                  <div class="streak-badge" [class.super]="currentStreak >= 10">
                    <span class="material-icons">local_fire_department</span>
                    <span>{{ currentStreak }}x</span>
                  </div>
                }
              </div>

              <!-- Word Display -->
              <div class="word-display">
                <div class="current-word" [class.shake]="shakeWord" [class.correct]="wordCorrect">
                  @for (char of currentWord.split(''); track $index) {
                    <span
                      class="char"
                      [class.correct]="$index < typedText.length && typedText[$index] === char"
                      [class.incorrect]="$index < typedText.length && typedText[$index] !== char"
                      [class.current]="$index === typedText.length"
                    >
                      {{ char }}
                    </span>
                  }
                </div>

                <div class="preview-words">
                  @for (word of previewWords; track $index) {
                    <span class="preview-word">{{ word }}</span>
                  }
                </div>
              </div>

              <!-- Input Area -->
              <div class="input-area">
                <input
                  #gameInput
                  type="text"
                  [(ngModel)]="typedText"
                  (ngModelChange)="onTyping()"
                  (keydown)="onKeyDown($event)"
                  [placeholder]="language === 'fr' ? 'Tapez ici...' : 'Type here...'"
                  autocomplete="off"
                  autocapitalize="off"
                  autocorrect="off"
                  spellcheck="false"
                  class="game-input"
                />
              </div>

              <!-- Confetti container -->
              <div class="confetti-container" #confettiContainer></div>
            </div>
          }

          <!-- Finished State -->
          @if (gameState === 'finished' && gameResult) {
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
                <h2>{{ language === 'fr' ? 'Partie terminée !' : 'Game Over!' }}</h2>
              </div>

              <div class="results-grid">
                <div class="result-card main">
                  <span class="result-value animate-count">{{ gameResult.correctWords }}</span>
                  <span class="result-label">{{ language === 'fr' ? 'Mots corrects' : 'Correct Words' }}</span>
                </div>
                <div class="result-card">
                  <span class="result-value">{{ gameResult.wpm }}</span>
                  <span class="result-label">WPM</span>
                </div>
                <div class="result-card">
                  <span class="result-value">{{ gameResult.accuracy }}%</span>
                  <span class="result-label">{{ language === 'fr' ? 'Précision' : 'Accuracy' }}</span>
                </div>
                <div class="result-card">
                  <span class="result-value">{{ gameResult.maxStreak }}</span>
                  <span class="result-label">{{ language === 'fr' ? 'Meilleur combo' : 'Best Streak' }}</span>
                </div>
              </div>

              @if (newRank) {
                <div class="rank-announcement" [class.top3]="newRank <= 3" [class.top10]="newRank > 3 && newRank <= 10">
                  @if (newRank <= 3) {
                    <span class="material-icons">celebration</span>
                    <span>{{ language === 'fr' ? 'Incroyable ! Vous êtes' : 'Amazing! You are' }} #{{ newRank }} !</span>
                  } @else if (newRank <= 10) {
                    <span class="material-icons">stars</span>
                    <span>{{ language === 'fr' ? 'Bravo ! Top' : 'Great! Top' }} {{ newRank }} !</span>
                  }
                </div>
              }

              @if (isNewPersonalBest) {
                <div class="personal-best-announcement">
                  <span class="material-icons">auto_awesome</span>
                  <span>{{ language === 'fr' ? 'Nouveau record personnel !' : 'New personal best!' }}</span>
                </div>
              }

              <div class="action-buttons">
                <button (click)="startCountdown()" class="play-again-button">
                  <span class="material-icons">replay</span>
                  {{ language === 'fr' ? 'Rejouer' : 'Play Again' }}
                </button>
                <button (click)="goBack()" class="back-to-menu-button">
                  <span class="material-icons">home</span>
                  {{ language === 'fr' ? 'Menu' : 'Menu' }}
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
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .typing-game-container {
      @apply min-h-screen p-6 relative overflow-hidden;
    }

    .background-gradient {
      @apply absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none;
      background: linear-gradient(-45deg, #10b981, #059669, #0d9488, #14b8a6);
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

    /* Header */
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

    .language-badge {
      @apply px-4 py-2 rounded-full font-medium text-sm;
    }

    .language-badge.french {
      @apply bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300;
    }

    .language-badge.english {
      @apply bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300;
    }

    /* Content Layout */
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
      @apply relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-6;
    }

    .intro-icon .material-icons {
      @apply text-5xl text-primary-600 dark:text-primary-400;
    }

    .time-badge {
      @apply absolute -bottom-2 -right-2 px-3 py-1 bg-primary-600 text-white text-sm font-bold rounded-full;
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
      @apply flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100;
    }

    .start-button .material-icons {
      @apply text-3xl;
    }

    .login-hint {
      @apply mt-4 text-sm text-gray-500 dark:text-gray-400;
    }

    /* Countdown State */
    .countdown-state {
      @apply flex flex-col items-center;
    }

    .countdown-number {
      @apply text-9xl font-black text-primary-600 dark:text-primary-400;
    }

    .countdown-number.animate {
      animation: countdownPop 1s ease-out;
    }

    @keyframes countdownPop {
      0% { transform: scale(0.5); opacity: 0; }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }

    .countdown-state p {
      @apply text-xl text-gray-600 dark:text-gray-400 mt-4;
    }

    /* Playing State */
    .playing-state {
      @apply w-full flex flex-col items-center relative;
    }

    .stats-bar {
      @apply flex items-center justify-between w-full mb-8 px-4;
    }

    .timer-section {
      @apply relative;
    }

    .timer-circle {
      @apply w-20 h-20 relative;
    }

    .timer-circle svg {
      @apply w-full h-full transform -rotate-90;
    }

    .timer-bg {
      fill: none;
      stroke: #e5e7eb;
      stroke-width: 3;
    }

    .dark .timer-bg {
      stroke: #374151;
    }

    .timer-progress {
      fill: none;
      stroke: #10b981;
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dasharray 1s linear;
    }

    .timer-section.warning .timer-progress {
      stroke: #f59e0b;
    }

    .timer-section.critical .timer-progress {
      stroke: #ef4444;
      animation: pulse 0.5s ease-in-out infinite;
    }

    .timer-text {
      @apply absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white;
    }

    .timer-section.warning .timer-text {
      @apply text-amber-600;
    }

    .timer-section.critical .timer-text {
      @apply text-red-600;
    }

    .live-stats {
      @apply flex gap-8;
    }

    .stat-item {
      @apply flex flex-col items-center;
    }

    .stat-value {
      @apply text-3xl font-bold text-gray-900 dark:text-white;
    }

    .stat-value.score-animate.bump {
      animation: scoreBump 0.2s ease-out;
    }

    @keyframes scoreBump {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); color: #10b981; }
      100% { transform: scale(1); }
    }

    .stat-label {
      @apply text-sm text-gray-500 dark:text-gray-400;
    }

    .streak-badge {
      @apply flex items-center gap-1 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400 font-bold;
      animation: streakPulse 0.5s ease-out;
    }

    .streak-badge.super {
      @apply bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400;
      animation: superStreak 0.3s ease-out infinite;
    }

    @keyframes streakPulse {
      0% { transform: scale(0.8); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    @keyframes superStreak {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    /* Word Display */
    .word-display {
      @apply flex flex-col items-center mb-8;
    }

    .current-word {
      @apply text-6xl font-mono font-bold tracking-wider mb-4 transition-transform;
    }

    .current-word.shake {
      animation: shake 0.3s ease-in-out;
    }

    .current-word.correct {
      animation: correctWord 0.3s ease-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }

    @keyframes correctWord {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); color: #10b981; }
      100% { transform: scale(1); }
    }

    .char {
      @apply text-gray-400 dark:text-gray-500 transition-colors duration-100;
    }

    .char.correct {
      @apply text-primary-600 dark:text-primary-400;
    }

    .char.incorrect {
      @apply text-red-500 bg-red-100 dark:bg-red-900/30 rounded;
    }

    .char.current {
      @apply border-b-4 border-primary-500;
    }

    .preview-words {
      @apply flex gap-4 text-xl text-gray-400 dark:text-gray-600;
    }

    .preview-word {
      @apply opacity-60;
    }

    /* Input Area */
    .input-area {
      @apply w-full max-w-lg;
    }

    .game-input {
      @apply w-full px-6 py-4 text-2xl text-center bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-2xl focus:border-primary-500 focus:outline-none transition-all;
      @apply text-gray-900 dark:text-white;
    }

    /* Confetti */
    .confetti-container {
      @apply absolute inset-0 pointer-events-none overflow-hidden;
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
      @apply col-span-2 bg-gradient-to-br from-primary-500 to-primary-600 text-white;
    }

    .result-value {
      @apply block text-4xl font-bold text-gray-900 dark:text-white;
    }

    .result-card.main .result-value {
      @apply text-white text-6xl;
    }

    .result-value.animate-count {
      animation: countUp 0.5s ease-out;
    }

    @keyframes countUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .result-label {
      @apply text-sm text-gray-500 dark:text-gray-400 mt-1;
    }

    .result-card.main .result-label {
      @apply text-primary-100;
    }

    .rank-announcement {
      @apply flex items-center gap-2 px-6 py-3 rounded-full font-bold mb-4;
      animation: slideIn 0.5s ease-out 0.3s both;
    }

    .rank-announcement.top3 {
      @apply bg-gradient-to-r from-amber-400 to-amber-500 text-white;
    }

    .rank-announcement.top10 {
      @apply bg-gradient-to-r from-primary-400 to-primary-500 text-white;
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
      @apply flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all;
    }

    .back-to-menu-button {
      @apply flex items-center gap-2 px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
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
  `]
})
export class TypingGameComponent implements OnInit, OnDestroy {
  @ViewChild('gameInput') gameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('confettiContainer') confettiContainer!: ElementRef<HTMLDivElement>;

  @Input() language: 'fr' | 'en' = 'fr';

  gameState: GameState = 'idle';
  countdown = 3;
  timeLeft = 60;
  timerProgress = 100;

  words: string[] = [];
  currentWord = '';
  previewWords: string[] = [];
  typedText = '';
  wordIndex = 0;

  correctWords = 0;
  totalTypedWords = 0;
  totalCharacters = 0;
  correctCharacters = 0;
  currentWpm = 0;
  currentAccuracy = 100;
  currentStreak = 0;
  maxStreak = 0;

  shakeWord = false;
  wordCorrect = false;
  scoreBump = false;

  leaderboard: LeaderboardEntry[] = [];
  isLoadingLeaderboard = false;
  highlightedEntryId: string | null = null;

  personalBest = 0;
  newRank: number | null = null;
  isNewPersonalBest = false;
  gameResult: TypingGameResult | null = null;

  currentUser: { id: string; firstName: string; lastName: string } | null = null;

  private gameTimer: ReturnType<typeof setInterval> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private startTime = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playgroundService: PlaygroundService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Get language from route URL
    const url = this.router.url;
    if (url.includes('typing-en')) {
      this.language = 'en';
    } else {
      this.language = 'fr';
    }

    // Load words based on language
    this.words = this.language === 'fr' ? [...FRENCH_WORDS] : [...ENGLISH_WORDS];
    this.shuffleWords();

    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadPersonalBest();
      }
    });

    // Load leaderboard
    this.loadLeaderboard();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Start game on Enter when idle
    if (this.gameState === 'idle' && event.key === 'Enter' && this.currentUser) {
      this.startCountdown();
    }
  }

  shuffleWords(): void {
    for (let i = this.words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.words[i], this.words[j]] = [this.words[j], this.words[i]];
    }
  }

  async loadLeaderboard(): Promise<void> {
    this.isLoadingLeaderboard = true;
    try {
      const slug = this.language === 'fr' ? 'typing-fr' : 'typing-en';
      this.leaderboard = await this.playgroundService.getLeaderboard(slug);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      this.isLoadingLeaderboard = false;
    }
  }

  async loadPersonalBest(): Promise<void> {
    try {
      const slug = this.language === 'fr' ? 'typing-fr' : 'typing-en';
      const myScores = await this.playgroundService.getMyScores(slug);
      this.personalBest = myScores.bestScore;
    } catch (error) {
      console.error('Error loading personal best:', error);
    }
  }

  startCountdown(): void {
    this.gameState = 'countdown';
    this.countdown = 3;
    this.resetGameStats();

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
    this.timeLeft = 60;
    this.timerProgress = 100;
    this.startTime = Date.now();
    this.wordIndex = 0;
    this.shuffleWords();
    this.nextWord();

    // Focus input
    setTimeout(() => {
      this.gameInput?.nativeElement?.focus();
    }, 100);

    // Start game timer
    this.gameTimer = setInterval(() => {
      this.timeLeft--;
      this.timerProgress = (this.timeLeft / 60) * 100;
      this.updateLiveStats();

      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  nextWord(): void {
    if (this.wordIndex >= this.words.length) {
      this.shuffleWords();
      this.wordIndex = 0;
    }

    this.currentWord = this.words[this.wordIndex];
    this.previewWords = this.words.slice(this.wordIndex + 1, this.wordIndex + 4);
    this.typedText = '';
    this.wordIndex++;
  }

  onTyping(): void {
    // Check for correct characters (live feedback)
    this.updateLiveStats();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.submitWord();
    }
  }

  submitWord(): void {
    const typed = this.typedText.trim().toLowerCase();
    const target = this.currentWord.toLowerCase();

    this.totalTypedWords++;
    this.totalCharacters += typed.length;

    if (typed === target) {
      // Correct word
      this.correctWords++;
      this.correctCharacters += target.length;
      this.currentStreak++;
      this.maxStreak = Math.max(this.maxStreak, this.currentStreak);

      // Visual feedback
      this.wordCorrect = true;
      this.scoreBump = true;
      setTimeout(() => {
        this.wordCorrect = false;
        this.scoreBump = false;
      }, 300);

      // Confetti on streak milestones
      if (this.currentStreak % 5 === 0) {
        this.createConfetti();
      }
    } else {
      // Incorrect word
      this.currentStreak = 0;
      this.shakeWord = true;
      setTimeout(() => {
        this.shakeWord = false;
      }, 300);
    }

    this.nextWord();
    this.updateLiveStats();
  }

  updateLiveStats(): void {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    if (elapsedMinutes > 0) {
      this.currentWpm = Math.round(this.correctWords / elapsedMinutes);
    }

    if (this.totalTypedWords > 0) {
      this.currentAccuracy = Math.round((this.correctWords / this.totalTypedWords) * 100);
    }
  }

  async endGame(): Promise<void> {
    this.clearTimers();
    this.gameState = 'finished';

    const elapsedMinutes = 1; // 60 seconds = 1 minute
    const wpm = Math.round(this.correctWords / elapsedMinutes);
    const accuracy = this.totalTypedWords > 0
      ? Math.round((this.correctWords / this.totalTypedWords) * 100)
      : 100;

    this.gameResult = {
      wordsTyped: this.totalTypedWords,
      correctWords: this.correctWords,
      wpm,
      accuracy,
      streak: this.currentStreak,
      maxStreak: this.maxStreak
    };

    // Submit score
    try {
      const slug = this.language === 'fr' ? 'typing-fr' : 'typing-en';
      const response = await this.playgroundService.submitScore(
        slug,
        this.correctWords,
        wpm,
        accuracy,
        { maxStreak: this.maxStreak }
      );

      this.newRank = response.rank <= 10 ? response.rank : null;
      this.isNewPersonalBest = response.isNewPersonalBest;

      if (this.isNewPersonalBest) {
        this.personalBest = this.correctWords;
      }

      // Reload leaderboard and highlight new entry if in top 10
      await this.loadLeaderboard();

      if (this.newRank && this.newRank <= 10) {
        // Find the user's entry in the leaderboard (only show once even if multiple scores)
        const userEntry = this.leaderboard.find(e => e.userId === this.currentUser?.id);
        if (userEntry) {
          this.highlightedEntryId = userEntry.id;
        }
      }

    } catch (error) {
      console.error('Error submitting score:', error);
      this.toastService.error(
        this.language === 'fr' ? 'Erreur' : 'Error',
        this.language === 'fr' ? 'Impossible de sauvegarder le score' : 'Could not save score'
      );
    }
  }

  resetGameStats(): void {
    this.correctWords = 0;
    this.totalTypedWords = 0;
    this.totalCharacters = 0;
    this.correctCharacters = 0;
    this.currentWpm = 0;
    this.currentAccuracy = 100;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.newRank = null;
    this.isNewPersonalBest = false;
    this.gameResult = null;
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

  createConfetti(): void {
    if (!this.confettiContainer?.nativeElement) return;

    const colors = ['#10b981', '#059669', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
    const container = this.confettiContainer.nativeElement;

    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: 50%;
        top: 50%;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        pointer-events: none;
        animation: confettiFall ${1 + Math.random()}s ease-out forwards;
        transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
        --x: ${(Math.random() - 0.5) * 400}px;
        --y: ${-Math.random() * 300 - 100}px;
        --r: ${Math.random() * 720 - 360}deg;
      `;
      container.appendChild(confetti);

      setTimeout(() => confetti.remove(), 1500);
    }

    // Add confetti animation if not exists
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes confettiFall {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) rotate(var(--r));
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  goBack(): void {
    this.router.navigate(['/playground']);
  }
}
