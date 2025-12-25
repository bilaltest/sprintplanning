import {
  Component,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameState, LeaderboardEntry } from '@models/game.model';
import { PlaygroundService } from '@services/playground.service';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';

interface ColorOption {
  name: string;
  displayName: string;
  hex: string;
  textColor: string;
}

interface Round {
  wordColor: ColorOption;
  displayColor: ColorOption;
  isLying: boolean; // Si true, le feedback sera inversé
}

@Component({
  selector: 'app-color-chaos',
  standalone: true,
  imports: [CommonModule, LeaderboardComponent],
  template: `
    <div class="color-chaos-container">
      <!-- Background -->
      <div class="background-gradient" [class.active]="gameState === 'playing'"></div>

      <!-- Header -->
      <div class="game-header">
        <button (click)="goBack()" class="back-button">
          <span class="material-icons">arrow_back</span>
          Retour
        </button>
        <div class="game-title">
          <span class="material-icons text-3xl text-purple-500">palette</span>
          <h1>Color Chaos</h1>
        </div>
        <div class="warning-badge">
          <span class="material-icons">warning</span>
          L'interface ment !
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
                  <span class="material-icons">psychology</span>
                  <span class="time-badge">60s</span>
                </div>
                <h2>Prêt pour le chaos ?</h2>
                <p class="mb-4">
                  Un mot de couleur s'affiche, mais dans une <strong>autre couleur</strong>.
                  <br>Cliquez sur le bouton correspondant au <strong>MOT</strong>, pas à la couleur du texte !
                </p>
                <div class="example-box">
                  <div class="example-title">Exemple :</div>
                  <div class="example-word" style="color: #ef4444;">BLEU</div>
                  <div class="example-hint">
                    → Cliquez sur "BLEU" (le mot écrit), pas "ROUGE" (la couleur affichée)
                  </div>
                </div>
                <div class="warning-box">
                  <span class="material-icons">psychology_alt</span>
                  <div>
                    <strong>Attention !</strong> Les feedbacks visuels et sonores mentent.
                    <br>Ne faites confiance qu'à votre compteur final !
                  </div>
                </div>

                @if (personalBest > 0) {
                  <div class="personal-best">
                    <span class="material-icons text-amber-500">emoji_events</span>
                    <span>Votre record : <strong>{{ personalBest }} pts</strong></span>
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
                <p class="login-hint">
                  Connectez-vous pour jouer et sauvegarder vos scores
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
              <p>Préparez-vous...</p>
            </div>
          }

          <!-- Playing State -->
          @if (gameState === 'playing' && currentRound) {
            <div class="playing-state">
              <!-- Timer & Stats Bar -->
              <div class="stats-bar">
                <div class="timer-section" [class.warning]="displayTimeLeft <= 10" [class.critical]="displayTimeLeft <= 5">
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
                        [attr.stroke-dasharray]="displayTimerProgress + ', 100'"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span class="timer-text">{{ displayTimeLeft }}</span>
                  </div>
                </div>

                <div class="live-stats">
                  <div class="stat-item">
                    <span class="stat-value" [class.bump]="scoreBump">{{ displayScore }}</span>
                    <span class="stat-label">Score</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ displayStreak }}</span>
                    <span class="stat-label">Combo</span>
                  </div>
                </div>
              </div>

              <!-- Color Word Display -->
              <div class="word-display">
                <div
                  class="color-word"
                  [style.color]="currentRound.displayColor.hex"
                  [class.shake]="shakeWord"
                  [class.glow]="glowWord"
                >
                  {{ currentRound.wordColor.displayName }}
                </div>
                <div class="round-counter">Question {{ roundNumber }} / {{ totalRounds }}</div>
              </div>

              <!-- Color Buttons -->
              <div class="color-buttons" [class.shuffle]="shuffleButtons">
                @for (color of colorOptions; track color.name) {
                  <button
                    (click)="selectColor(color)"
                    class="color-button"
                    [style.background]="color.hex"
                    [style.color]="color.textColor"
                    [class.pulse]="Math.random() > 0.7"
                  >
                    {{ color.displayName }}
                  </button>
                }
              </div>

              <!-- Fake Feedback (lies!) -->
              @if (showFeedback) {
                <div
                  class="feedback-overlay"
                  [class.success]="feedbackType === 'success'"
                  [class.error]="feedbackType === 'error'"
                >
                  <div class="feedback-content">
                    <span class="material-icons">
                      {{ feedbackType === 'success' ? 'check_circle' : 'cancel' }}
                    </span>
                    <span>{{ feedbackMessage }}</span>
                  </div>
                </div>
              }
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
                <h2>Partie terminée !</h2>
                <p class="reveal-message">Voici votre VRAI score :</p>
              </div>

              <div class="results-grid">
                <div class="result-card main">
                  <span class="result-value animate-count">{{ finalScore }}</span>
                  <span class="result-label">Points (vrai score !)</span>
                </div>
                <div class="result-card">
                  <span class="result-value">{{ totalCorrect }}</span>
                  <span class="result-label">Bonnes réponses</span>
                </div>
                <div class="result-card">
                  <span class="result-value">{{ maxStreak }}</span>
                  <span class="result-label">Meilleur combo</span>
                </div>
                <div class="result-card">
                  <span class="result-value">{{ Math.round((totalCorrect / totalRounds) * 100) }}%</span>
                  <span class="result-label">Précision</span>
                </div>
              </div>

              @if (newRank) {
                <div class="rank-announcement" [class.top3]="newRank <= 3" [class.top10]="newRank > 3 && newRank <= 10">
                  @if (newRank <= 3) {
                    <span class="material-icons">celebration</span>
                    <span>Incroyable ! Vous êtes #{{ newRank }} !</span>
                  } @else if (newRank <= 10) {
                    <span class="material-icons">stars</span>
                    <span>Bravo ! Top {{ newRank }} !</span>
                  }
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
            scoreUnit="pts"
            [showWpm]="false"
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .color-chaos-container {
      @apply min-h-screen p-6 relative overflow-hidden;
    }

    .background-gradient {
      @apply absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none;
      background: linear-gradient(-45deg, #8b5cf6, #ec4899, #f59e0b, #10b981);
      background-size: 400% 400%;
    }

    .background-gradient.active {
      @apply opacity-10;
      animation: gradientShift 5s ease infinite;
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

    .warning-badge {
      @apply flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium text-sm;
      animation: pulse 2s ease-in-out infinite;
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
      @apply flex flex-col items-center text-center max-w-2xl;
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

    .time-badge {
      @apply absolute -bottom-2 -right-2 px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-full;
    }

    .game-intro h2 {
      @apply text-3xl font-bold text-gray-900 dark:text-white mb-4;
    }

    .game-intro p {
      @apply text-gray-600 dark:text-gray-400 max-w-md;
    }

    .example-box {
      @apply mt-6 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-800;
    }

    .example-title {
      @apply text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3;
    }

    .example-word {
      @apply text-5xl font-bold mb-3;
    }

    .example-hint {
      @apply text-sm text-purple-600 dark:text-purple-400;
    }

    .warning-box {
      @apply flex gap-3 mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-left;
    }

    .warning-box .material-icons {
      @apply text-amber-600 dark:text-amber-400;
    }

    .warning-box div {
      @apply text-sm text-amber-700 dark:text-amber-400;
    }

    .personal-best {
      @apply flex items-center gap-2 mt-6 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-full text-amber-700 dark:text-amber-400;
    }

    .start-button {
      @apply flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100;
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
      @apply text-9xl font-black text-purple-600 dark:text-purple-400;
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
      @apply flex items-center justify-between w-full mb-12 px-4;
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
      stroke: #8b5cf6;
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

    .live-stats {
      @apply flex gap-8;
    }

    .stat-item {
      @apply flex flex-col items-center;
    }

    .stat-value {
      @apply text-3xl font-bold text-gray-900 dark:text-white;
    }

    .stat-value.bump {
      animation: scoreBump 0.2s ease-out;
    }

    @keyframes scoreBump {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); color: #8b5cf6; }
      100% { transform: scale(1); }
    }

    .stat-label {
      @apply text-sm text-gray-500 dark:text-gray-400;
    }

    /* Word Display */
    .word-display {
      @apply flex flex-col items-center mb-12;
    }

    .color-word {
      @apply text-8xl font-black tracking-wider mb-4 transition-all duration-200;
    }

    .color-word.shake {
      animation: shake 0.4s ease-in-out;
    }

    .color-word.glow {
      animation: glow 0.4s ease-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0) rotate(0deg); }
      25% { transform: translateX(-15px) rotate(-5deg); }
      75% { transform: translateX(15px) rotate(5deg); }
    }

    @keyframes glow {
      0% { transform: scale(1); filter: brightness(1); }
      50% { transform: scale(1.1); filter: brightness(1.5) drop-shadow(0 0 20px currentColor); }
      100% { transform: scale(1); filter: brightness(1); }
    }

    .round-counter {
      @apply text-lg text-gray-500 dark:text-gray-400;
    }

    /* Color Buttons */
    .color-buttons {
      @apply grid grid-cols-2 gap-4 w-full max-w-2xl;
      transition: all 0.3s ease;
    }

    .color-buttons.shuffle {
      animation: shuffle 0.3s ease;
    }

    @keyframes shuffle {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(0.95) rotate(1deg); }
    }

    .color-button {
      @apply px-8 py-6 text-2xl font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-4 border-transparent hover:border-white/50;
    }

    .color-button.pulse {
      animation: buttonPulse 1s ease-in-out infinite;
    }

    @keyframes buttonPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    /* Feedback Overlay */
    .feedback-overlay {
      @apply absolute inset-0 flex items-center justify-center backdrop-blur-sm z-50;
      animation: fadeIn 0.2s ease-out;
    }

    .feedback-overlay.success {
      @apply bg-red-500/20;
    }

    .feedback-overlay.error {
      @apply bg-green-500/20;
    }

    .feedback-content {
      @apply flex flex-col items-center gap-4 p-8 rounded-2xl;
    }

    .feedback-overlay.success .feedback-content {
      @apply bg-red-500 text-white;
    }

    .feedback-overlay.error .feedback-content {
      @apply bg-green-500 text-white;
    }

    .feedback-content .material-icons {
      @apply text-6xl;
    }

    .feedback-content span:last-child {
      @apply text-2xl font-bold;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Finished State */
    .finished-state {
      @apply flex flex-col items-center text-center;
      animation: fadeInUp 0.5s ease-out;
    }

    @keyframes fadeInUp {
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

    .reveal-message {
      @apply text-lg text-purple-600 dark:text-purple-400 mt-2 font-semibold;
    }

    .results-grid {
      @apply grid grid-cols-2 gap-4 mb-6;
    }

    .result-card {
      @apply p-6 bg-gray-100 dark:bg-gray-700 rounded-2xl;
    }

    .result-card.main {
      @apply col-span-2 bg-gradient-to-br from-purple-500 to-pink-600 text-white;
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
      @apply text-purple-100;
    }

    .rank-announcement {
      @apply flex items-center gap-2 px-6 py-3 rounded-full font-bold mb-4;
      animation: slideIn 0.5s ease-out 0.3s both;
    }

    .rank-announcement.top3 {
      @apply bg-gradient-to-r from-amber-400 to-amber-500 text-white;
    }

    .rank-announcement.top10 {
      @apply bg-gradient-to-r from-purple-400 to-pink-500 text-white;
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
      @apply flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all;
    }

    .back-to-menu-button {
      @apply flex items-center gap-2 px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    /* Responsive */
    @media (max-width: 1280px) {
      .game-content {
        @apply flex-col;
      }

      .leaderboard-section {
        @apply w-full;
      }

      .color-word {
        @apply text-6xl;
      }

      .color-buttons {
        @apply gap-3;
      }

      .color-button {
        @apply px-6 py-4 text-xl;
      }
    }
  `]
})
export class ColorChaosComponent implements OnInit, OnDestroy {
  Math = Math; // Expose Math for template

  gameState: GameState = 'idle';
  countdown = 3;

  // Real values (hidden from player)
  realTimeLeft = 60;
  realScore = 0;
  realStreak = 0;

  // Display values (can lie!)
  displayTimeLeft = 60;
  displayTimerProgress = 100;
  displayScore = 0;
  displayStreak = 0;

  colorOptions: ColorOption[] = [
    { name: 'red', displayName: 'ROUGE', hex: '#ef4444', textColor: '#ffffff' },
    { name: 'blue', displayName: 'BLEU', hex: '#3b82f6', textColor: '#ffffff' },
    { name: 'green', displayName: 'VERT', hex: '#10b981', textColor: '#ffffff' },
    { name: 'yellow', displayName: 'JAUNE', hex: '#f59e0b', textColor: '#000000' },
    { name: 'purple', displayName: 'VIOLET', hex: '#8b5cf6', textColor: '#ffffff' },
    { name: 'orange', displayName: 'ORANGE', hex: '#f97316', textColor: '#ffffff' },
    { name: 'pink', displayName: 'ROSE', hex: '#ec4899', textColor: '#ffffff' },
    { name: 'cyan', displayName: 'CYAN', hex: '#06b6d4', textColor: '#000000' }
  ];

  currentRound: Round | null = null;
  roundNumber = 0;
  totalRounds = 30;
  totalCorrect = 0;
  maxStreak = 0;
  finalScore = 0;

  shakeWord = false;
  glowWord = false;
  scoreBump = false;
  shuffleButtons = false;

  showFeedback = false;
  feedbackType: 'success' | 'error' = 'success';
  feedbackMessage = '';

  leaderboard: LeaderboardEntry[] = [];
  isLoadingLeaderboard = false;
  highlightedEntryId: string | null = null;

  personalBest = 0;
  newRank: number | null = null;
  isNewPersonalBest = false;

  currentUser: { id: string; firstName: string; lastName: string } | null = null;

  private gameTimer: ReturnType<typeof setInterval> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

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

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.gameState === 'idle' && event.key === 'Enter' && this.currentUser) {
      this.startCountdown();
    }
  }

  async loadLeaderboard(): Promise<void> {
    this.isLoadingLeaderboard = true;
    try {
      this.leaderboard = await this.playgroundService.getLeaderboard('color-chaos');
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      this.isLoadingLeaderboard = false;
    }
  }

  async loadPersonalBest(): Promise<void> {
    try {
      const myScores = await this.playgroundService.getMyScores('color-chaos');
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
    this.realTimeLeft = 60;
    this.displayTimeLeft = 60;
    this.displayTimerProgress = 100;
    this.roundNumber = 0;

    this.nextRound();

    this.gameTimer = setInterval(() => {
      this.realTimeLeft--;

      // Sometimes lie about time (but not too much to keep it playable)
      if (Math.random() > 0.7) {
        this.displayTimeLeft = Math.max(0, this.realTimeLeft + Math.floor(Math.random() * 6 - 3));
      } else {
        this.displayTimeLeft = this.realTimeLeft;
      }

      this.displayTimerProgress = (this.realTimeLeft / 60) * 100;

      if (this.realTimeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  nextRound(): void {
    if (this.roundNumber >= this.totalRounds || this.realTimeLeft <= 0) {
      this.endGame();
      return;
    }

    this.roundNumber++;

    // Shuffle buttons sometimes
    if (Math.random() > 0.7) {
      this.shuffleButtons = true;
      setTimeout(() => this.shuffleButtons = false, 300);
      this.colorOptions = this.shuffleArray([...this.colorOptions]);
    }

    // Select word color and display color (different!)
    const wordColor = this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)];
    let displayColor = this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)];

    // Ensure they're different
    while (displayColor.name === wordColor.name) {
      displayColor = this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)];
    }

    // 50% chance the feedback will lie
    const isLying = Math.random() > 0.5;

    this.currentRound = {
      wordColor,
      displayColor,
      isLying
    };
  }

  selectColor(selectedColor: ColorOption): void {
    if (!this.currentRound) return;

    const isCorrect = selectedColor.name === this.currentRound.wordColor.name;

    if (isCorrect) {
      this.realScore += 10;
      this.realStreak++;
      this.maxStreak = Math.max(this.maxStreak, this.realStreak);
      this.totalCorrect++;

      // Combo bonus
      if (this.realStreak >= 3) {
        this.realScore += this.realStreak * 2;
      }

      this.glowWord = true;
      setTimeout(() => this.glowWord = false, 400);
    } else {
      this.realStreak = 0;
      this.shakeWord = true;
      setTimeout(() => this.shakeWord = false, 400);
    }

    // Show LYING feedback
    if (this.currentRound.isLying) {
      // Invert the feedback
      this.feedbackType = isCorrect ? 'error' : 'success';
      this.feedbackMessage = isCorrect ? 'FAUX !' : 'CORRECT !';
    } else {
      // Show real feedback (but rarely)
      this.feedbackType = isCorrect ? 'success' : 'error';
      this.feedbackMessage = isCorrect ? 'CORRECT !' : 'FAUX !';
    }

    this.showFeedback = true;

    setTimeout(() => {
      this.showFeedback = false;
      this.nextRound();
    }, 600);

    // Update display values with lies
    this.updateDisplayValues();
  }

  updateDisplayValues(): void {
    // Sometimes show wrong score
    if (Math.random() > 0.6) {
      this.displayScore = Math.max(0, this.realScore + Math.floor(Math.random() * 40 - 20));
      this.scoreBump = true;
      setTimeout(() => this.scoreBump = false, 200);
    } else {
      this.displayScore = this.realScore;
    }

    // Sometimes show wrong streak
    if (Math.random() > 0.7) {
      this.displayStreak = Math.max(0, this.realStreak + Math.floor(Math.random() * 6 - 3));
    } else {
      this.displayStreak = this.realStreak;
    }
  }

  async endGame(): Promise<void> {
    this.clearTimers();
    this.gameState = 'finished';
    this.finalScore = this.realScore;

    const accuracy = this.totalRounds > 0
      ? Math.round((this.totalCorrect / this.totalRounds) * 100)
      : 0;

    try {
      const response = await this.playgroundService.submitScore(
        'color-chaos',
        this.finalScore,
        this.totalCorrect,
        accuracy,
        { maxStreak: this.maxStreak, totalRounds: this.totalRounds }
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

  resetGameStats(): void {
    this.realScore = 0;
    this.realStreak = 0;
    this.displayScore = 0;
    this.displayStreak = 0;
    this.roundNumber = 0;
    this.totalCorrect = 0;
    this.maxStreak = 0;
    this.finalScore = 0;
    this.newRank = null;
    this.isNewPersonalBest = false;
    this.highlightedEntryId = null;
    this.currentRound = null;
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

  shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  goBack(): void {
    this.router.navigate(['/playground']);
  }
}
