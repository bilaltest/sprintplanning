import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlaygroundService } from '@services/playground.service';
import { AuthService } from '@services/auth.service';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { LeaderboardEntry } from '@models/game.model';

type Operation = '+' | '-' | '×' | '÷' | '^';

interface MathProblem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  displayText: string;
}

interface GameStats {
  correct: number;
  wrong: number;
  streak: number;
  maxStreak: number;
  totalTime: number;
}

@Component({
  selector: 'app-math-rush',
  standalone: true,
  imports: [CommonModule, FormsModule, LeaderboardComponent],
  template: `
    <div class="math-rush-container">
      <!-- Header -->
      <div class="game-header">
        <button (click)="goBack()" class="back-btn">
          <span class="material-icons">arrow_back</span>
          <span>Retour</span>
        </button>
        <h1 class="game-title">
          <span class="material-icons">calculate</span>
          Math Rush
        </h1>
        <div class="header-spacer"></div>
      </div>

      <!-- Main Content -->
      <div class="game-content">
        <!-- Leaderboard Panel -->
        <div class="leaderboard-panel">
          <app-leaderboard
            [entries]="leaderboard"
            [isLoading]="loadingLeaderboard"
            [newEntryId]="newEntryId"
          ></app-leaderboard>
        </div>

        <!-- Game Panel -->
        <div class="game-panel">
          <!-- Pre-game -->
          <div *ngIf="gameState === 'idle'" class="game-idle">
            <div class="intro-card">
              <div class="intro-icon">
                <span class="material-icons">psychology</span>
              </div>
              <h2>Math Rush</h2>
              <p class="subtitle">Mode Expert</p>
              <p class="description">Résolvez un maximum de calculs en 60 secondes !</p>

              <div class="challenge-badge">
                <span class="material-icons">local_fire_department</span>
                <span>+, -, ×, ÷, puissances</span>
              </div>

              <div class="rules">
                <div class="rule">
                  <span class="material-icons">timer</span>
                  <span>60 secondes chrono</span>
                </div>
                <div class="rule">
                  <span class="material-icons">check_circle</span>
                  <span>+10 points par bonne réponse</span>
                </div>
                <div class="rule">
                  <span class="material-icons">local_fire_department</span>
                  <span>Bonus streak : +5 pts tous les 5 corrects</span>
                </div>
                <div class="rule">
                  <span class="material-icons">cancel</span>
                  <span>-5 points par erreur (min 0)</span>
                </div>
              </div>

              <button (click)="startGame()" class="start-btn">
                <span class="material-icons">play_arrow</span>
                Commencer
              </button>
            </div>
          </div>

          <!-- Countdown -->
          <div *ngIf="gameState === 'countdown'" class="countdown-overlay">
            <div class="countdown-number" [class.animate]="true">
              {{ countdown }}
            </div>
          </div>

          <!-- Playing -->
          <div *ngIf="gameState === 'playing'" class="game-playing">
            <!-- Stats Bar -->
            <div class="stats-bar">
              <div class="stat timer" [class.warning]="timeLeft <= 10">
                <span class="material-icons">timer</span>
                <span class="stat-value">{{ timeLeft }}s</span>
              </div>
              <div class="stat score">
                <span class="material-icons">emoji_events</span>
                <span class="stat-value">{{ score }}</span>
              </div>
              <div class="stat streak" [class.on-fire]="stats.streak >= 5">
                <span class="material-icons">{{ stats.streak >= 5 ? 'local_fire_department' : 'bolt' }}</span>
                <span class="stat-value">{{ stats.streak }}</span>
              </div>
              <div class="stat accuracy">
                <span class="material-icons">target</span>
                <span class="stat-value">{{ getAccuracy() }}%</span>
              </div>
            </div>

            <!-- Problem Display -->
            <div class="problem-container" [class.correct]="feedbackState === 'correct'" [class.wrong]="feedbackState === 'wrong'">
              <div class="problem-text">
                {{ currentProblem?.displayText }}
              </div>

              <!-- Answer Input -->
              <div class="answer-section">
                <input
                  #answerInput
                  type="number"
                  [(ngModel)]="userAnswer"
                  (keyup.enter)="submitAnswer()"
                  class="answer-input"
                  placeholder="?"
                  [disabled]="feedbackState !== null"
                  autocomplete="off"
                />
                <button (click)="submitAnswer()" class="submit-btn" [disabled]="feedbackState !== null">
                  <span class="material-icons">send</span>
                </button>
              </div>

              <!-- Feedback -->
              <div *ngIf="feedbackState" class="feedback" [class.correct]="feedbackState === 'correct'" [class.wrong]="feedbackState === 'wrong'">
                <span class="material-icons">{{ feedbackState === 'correct' ? 'check_circle' : 'cancel' }}</span>
                <span>{{ feedbackState === 'correct' ? 'Correct !' : 'Réponse : ' + currentProblem?.answer }}</span>
              </div>
            </div>

            <!-- Progress indicators -->
            <div class="progress-indicators">
              <div
                *ngFor="let result of recentResults; let i = index"
                class="result-dot"
                [class.correct]="result"
                [class.wrong]="!result"
              ></div>
            </div>
          </div>

          <!-- Game Over -->
          <div *ngIf="gameState === 'finished'" class="game-finished">
            <div class="results-card" [class.new-record]="isNewRecord">
              <div *ngIf="isNewRecord" class="confetti-container">
                <div *ngFor="let i of confettiPieces" class="confetti" [style.--delay]="i * 0.1 + 's'" [style.--x]="getRandomX()"></div>
              </div>

              <div class="trophy-icon" [class.gold]="score >= 500" [class.silver]="score >= 300 && score < 500" [class.bronze]="score >= 100 && score < 300">
                <span class="material-icons">{{ score >= 300 ? 'emoji_events' : 'calculate' }}</span>
              </div>

              <h2>Partie terminée !</h2>

              <div class="final-score">
                <span class="score-label">Score final</span>
                <span class="score-value">{{ score }}</span>
              </div>

              <div class="stats-grid">
                <div class="stat-item">
                  <span class="material-icons">check_circle</span>
                  <span class="stat-label">Correct</span>
                  <span class="stat-value">{{ stats.correct }}</span>
                </div>
                <div class="stat-item">
                  <span class="material-icons">cancel</span>
                  <span class="stat-label">Erreurs</span>
                  <span class="stat-value">{{ stats.wrong }}</span>
                </div>
                <div class="stat-item">
                  <span class="material-icons">local_fire_department</span>
                  <span class="stat-label">Max Streak</span>
                  <span class="stat-value">{{ stats.maxStreak }}</span>
                </div>
                <div class="stat-item">
                  <span class="material-icons">percent</span>
                  <span class="stat-label">Précision</span>
                  <span class="stat-value">{{ getAccuracy() }}%</span>
                </div>
              </div>

              <div *ngIf="playerRank" class="rank-info">
                <span class="material-icons">leaderboard</span>
                <span>Vous êtes #{{ playerRank }} au classement !</span>
              </div>

              <div *ngIf="savingScore" class="saving-indicator">
                <span class="material-icons spinning">sync</span>
                <span>Enregistrement...</span>
              </div>

              <div *ngIf="saveError" class="save-error">
                <span class="material-icons">error</span>
                <span>{{ saveError }}</span>
              </div>

              <div class="action-buttons">
                <button (click)="playAgain()" class="play-again-btn">
                  <span class="material-icons">replay</span>
                  Rejouer
                </button>
                <button (click)="goBack()" class="back-to-games-btn">
                  <span class="material-icons">apps</span>
                  Autres jeux
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .math-rush-container {
      @apply min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6;
    }

    .game-header {
      @apply flex items-center justify-between mb-6 max-w-7xl mx-auto;
    }

    .back-btn {
      @apply flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-300;
    }

    .game-title {
      @apply flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white;
    }

    .game-title .material-icons {
      @apply text-3xl text-amber-500;
    }

    .header-spacer {
      @apply w-24;
    }

    .game-content {
      @apply flex gap-6 max-w-7xl mx-auto;
    }

    .leaderboard-panel {
      @apply w-80 flex-shrink-0;
    }

    .game-panel {
      @apply flex-1 min-h-[600px];
    }

    /* Idle State */
    .game-idle {
      @apply flex items-center justify-center h-full;
    }

    .intro-card {
      @apply bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-lg w-full;
    }

    .intro-icon {
      @apply w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center;
    }

    .intro-icon .material-icons {
      @apply text-4xl text-white;
    }

    .intro-card h2 {
      @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
    }

    .intro-card .subtitle {
      @apply text-amber-500 font-bold text-lg mb-2;
    }

    .intro-card .description {
      @apply text-gray-600 dark:text-gray-400 mb-4;
    }

    .challenge-badge {
      @apply flex items-center justify-center gap-2 px-4 py-2 mb-6 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full text-amber-700 dark:text-amber-400 font-medium text-sm;
    }

    .challenge-badge .material-icons {
      @apply text-lg text-orange-500;
    }

    .rules {
      @apply space-y-2 mb-6 text-left;
    }

    .rule {
      @apply flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400;
    }

    .rule .material-icons {
      @apply text-amber-500 text-lg;
    }

    .start-btn {
      @apply flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none;
    }

    /* Countdown */
    .countdown-overlay {
      @apply flex items-center justify-center h-full;
    }

    .countdown-number {
      @apply text-9xl font-bold text-amber-500;
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.8; }
    }

    /* Playing State */
    .game-playing {
      @apply bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 h-full flex flex-col;
    }

    .stats-bar {
      @apply flex justify-center gap-6 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700;
    }

    .stat {
      @apply flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700;
    }

    .stat .material-icons {
      @apply text-gray-500 dark:text-gray-400;
    }

    .stat-value {
      @apply font-bold text-gray-900 dark:text-white;
    }

    .stat.timer .material-icons {
      @apply text-blue-500;
    }

    .stat.timer.warning {
      @apply bg-red-100 dark:bg-red-900/30;
    }

    .stat.timer.warning .material-icons {
      @apply text-red-500;
      animation: pulse 0.5s ease-in-out infinite;
    }

    .stat.score .material-icons {
      @apply text-amber-500;
    }

    .stat.streak .material-icons {
      @apply text-orange-500;
    }

    .stat.streak.on-fire {
      @apply bg-orange-100 dark:bg-orange-900/30;
    }

    .stat.streak.on-fire .material-icons {
      @apply text-orange-500;
      animation: fire 0.3s ease-in-out infinite;
    }

    @keyframes fire {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    .stat.accuracy .material-icons {
      @apply text-green-500;
    }

    .problem-container {
      @apply flex-1 flex flex-col items-center justify-center transition-all duration-200;
    }

    .problem-container.correct {
      @apply bg-green-50 dark:bg-green-900/20 rounded-xl;
    }

    .problem-container.wrong {
      @apply bg-red-50 dark:bg-red-900/20 rounded-xl;
    }

    .problem-text {
      @apply text-6xl font-bold text-gray-900 dark:text-white mb-8 font-mono;
    }

    .answer-section {
      @apply flex items-center gap-3;
    }

    .answer-input {
      @apply w-40 text-center text-3xl font-bold py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition-colors;
    }

    .answer-input::-webkit-outer-spin-button,
    .answer-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .answer-input[type=number] {
      -moz-appearance: textfield;
    }

    .submit-btn {
      @apply w-14 h-14 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-50;
    }

    .feedback {
      @apply flex items-center gap-2 mt-4 px-4 py-2 rounded-lg font-medium;
    }

    .feedback.correct {
      @apply bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400;
    }

    .feedback.wrong {
      @apply bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400;
    }

    .progress-indicators {
      @apply flex justify-center gap-2 mt-6;
    }

    .result-dot {
      @apply w-3 h-3 rounded-full transition-all;
    }

    .result-dot.correct {
      @apply bg-green-500;
    }

    .result-dot.wrong {
      @apply bg-red-500;
    }

    /* Finished State */
    .game-finished {
      @apply flex items-center justify-center h-full;
    }

    .results-card {
      @apply bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-md w-full relative overflow-hidden;
    }

    .results-card.new-record {
      @apply ring-4 ring-amber-400 ring-opacity-50;
    }

    .confetti-container {
      @apply absolute inset-0 pointer-events-none overflow-hidden;
    }

    .confetti {
      @apply absolute w-3 h-3 top-0;
      left: calc(var(--x) * 100%);
      background: linear-gradient(135deg, #fbbf24, #f59e0b, #ef4444, #8b5cf6, #3b82f6);
      animation: confetti-fall 2s ease-out forwards;
      animation-delay: var(--delay);
    }

    @keyframes confetti-fall {
      0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
    }

    .trophy-icon {
      @apply w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center;
    }

    .trophy-icon.gold {
      @apply bg-gradient-to-br from-yellow-400 to-amber-500;
    }

    .trophy-icon.silver {
      @apply bg-gradient-to-br from-gray-300 to-gray-400;
    }

    .trophy-icon.bronze {
      @apply bg-gradient-to-br from-orange-400 to-orange-600;
    }

    .trophy-icon .material-icons {
      @apply text-4xl text-white;
    }

    .results-card h2 {
      @apply text-2xl font-bold text-gray-900 dark:text-white mb-4;
    }

    .final-score {
      @apply mb-6;
    }

    .score-label {
      @apply block text-sm text-gray-500 dark:text-gray-400 mb-1;
    }

    .score-value {
      @apply text-5xl font-bold text-amber-500;
    }

    .stats-grid {
      @apply grid grid-cols-2 gap-4 mb-6;
    }

    .stat-item {
      @apply flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg;
    }

    .stat-item .material-icons {
      @apply text-2xl mb-1;
    }

    .stat-item .material-icons:first-child {
      @apply text-gray-400;
    }

    .stat-item:nth-child(1) .material-icons { @apply text-green-500; }
    .stat-item:nth-child(2) .material-icons { @apply text-red-500; }
    .stat-item:nth-child(3) .material-icons { @apply text-orange-500; }
    .stat-item:nth-child(4) .material-icons { @apply text-blue-500; }

    .stat-label {
      @apply text-xs text-gray-500 dark:text-gray-400;
    }

    .stat-item .stat-value {
      @apply text-lg font-bold text-gray-900 dark:text-white;
    }

    .rank-info {
      @apply flex items-center justify-center gap-2 mb-4 text-amber-600 dark:text-amber-400 font-medium;
    }

    .saving-indicator {
      @apply flex items-center justify-center gap-2 text-gray-500 mb-4;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .save-error {
      @apply flex items-center justify-center gap-2 text-red-500 mb-4;
    }

    .action-buttons {
      @apply flex gap-3;
    }

    .play-again-btn {
      @apply flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all;
    }

    .back-to-games-btn {
      @apply flex-1 flex items-center justify-center gap-2 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .game-content {
        @apply flex-col;
      }

      .leaderboard-panel {
        @apply w-full;
      }
    }
  `]
})
export class MathRushComponent implements OnInit, OnDestroy {
  @ViewChild('answerInput') answerInput!: ElementRef<HTMLInputElement>;

  gameState: 'idle' | 'countdown' | 'playing' | 'finished' = 'idle';
  countdown = 3;
  timeLeft = 60;
  score = 0;

  currentProblem: MathProblem | null = null;
  userAnswer: number | null = null;
  feedbackState: 'correct' | 'wrong' | null = null;

  stats: GameStats = {
    correct: 0,
    wrong: 0,
    streak: 0,
    maxStreak: 0,
    totalTime: 0
  };

  recentResults: boolean[] = [];
  leaderboard: LeaderboardEntry[] = [];
  loadingLeaderboard = true;
  currentUserId: string | null = null;
  newEntryId: string | null = null;
  playerRank: number | null = null;
  isNewRecord = false;
  savingScore = false;
  saveError: string | null = null;

  confettiPieces = Array.from({ length: 50 }, (_, i) => i);

  private gameTimer: ReturnType<typeof setInterval> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private router: Router,
    private playgroundService: PlaygroundService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLeaderboard();
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id || null;
    });
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  async loadLeaderboard(): Promise<void> {
    this.loadingLeaderboard = true;
    try {
      this.leaderboard = await this.playgroundService.getLeaderboard('math-rush');
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      this.loadingLeaderboard = false;
    }
  }

  startGame(): void {

    this.gameState = 'countdown';
    this.countdown = 3;

    this.countdownTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.countdownTimer!);
        this.beginPlaying();
      }
    }, 1000);
  }

  private beginPlaying(): void {
    this.gameState = 'playing';
    this.timeLeft = 60;
    this.score = 0;
    this.stats = { correct: 0, wrong: 0, streak: 0, maxStreak: 0, totalTime: 0 };
    this.recentResults = [];
    this.newEntryId = null;
    this.playerRank = null;
    this.isNewRecord = false;
    this.saveError = null;

    this.generateProblem();

    this.gameTimer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft === 0) {
        this.endGame();
      }
    }, 1000);

    setTimeout(() => this.focusInput(), 100);
  }

  private generateProblem(): void {
    // Mode Expert : toutes les opérations avec des nombres plus grands
    const operations: Operation[] = ['+', '-', '×', '÷', '^'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1: number, num2: number, answer: number, displayText: string;

    switch (operation) {
      case '+':
        // Additions corsées : nombres à 2-3 chiffres
        num1 = this.randomInt(50, 500);
        num2 = this.randomInt(50, 500);
        answer = num1 + num2;
        displayText = `${num1} + ${num2} = ?`;
        break;
      case '-':
        // Soustractions corsées : résultat peut être négatif
        num1 = this.randomInt(10, 300);
        num2 = this.randomInt(10, 300);
        answer = num1 - num2;
        displayText = `${num1} - ${num2} = ?`;
        break;
      case '×':
        // Multiplications difficiles : 2 chiffres × 2 chiffres
        num1 = this.randomInt(11, 25);
        num2 = this.randomInt(6, 15);
        answer = num1 * num2;
        displayText = `${num1} × ${num2} = ?`;
        break;
      case '÷':
        // Divisions avec restes possibles ou nombres plus grands
        num2 = this.randomInt(3, 15);
        answer = this.randomInt(5, 20);
        num1 = num2 * answer;
        displayText = `${num1} ÷ ${num2} = ?`;
        break;
      case '^':
        // Puissances (carrés et cubes)
        num1 = this.randomInt(2, 12);
        num2 = this.randomInt(2, 3);
        answer = Math.pow(num1, num2);
        displayText = `${num1}² = ?`;
        if (num2 === 3) {
          displayText = `${num1}³ = ?`;
        }
        break;
      default:
        num1 = 1; num2 = 1; answer = 2;
        displayText = '1 + 1 = ?';
    }

    this.currentProblem = {
      num1,
      num2,
      operation,
      answer,
      displayText
    };
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  submitAnswer(): void {
    if (this.userAnswer === null || this.feedbackState !== null || !this.currentProblem) return;

    const isCorrect = this.userAnswer === this.currentProblem.answer;

    if (isCorrect) {
      this.stats.correct++;
      this.stats.streak++;
      this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.streak);
      this.score += 10;

      // Streak bonus every 5 correct
      if (this.stats.streak % 5 === 0) {
        this.score += 5;
      }

      this.feedbackState = 'correct';
    } else {
      this.stats.wrong++;
      this.stats.streak = 0;
      this.score = Math.max(0, this.score - 5);
      this.feedbackState = 'wrong';
    }

    this.recentResults.push(isCorrect);
    if (this.recentResults.length > 10) {
      this.recentResults.shift();
    }

    // Show feedback briefly then next problem
    setTimeout(() => {
      this.feedbackState = null;
      this.userAnswer = null;
      this.generateProblem();
      this.focusInput();
    }, 500);
  }

  private focusInput(): void {
    setTimeout(() => {
      if (this.answerInput?.nativeElement) {
        this.answerInput.nativeElement.focus();
      }
    }, 50);
  }

  private async endGame(): Promise<void> {
    this.clearTimers();
    this.gameState = 'finished';

    // Save score
    this.savingScore = true;
    try {
      const result = await this.playgroundService.submitScore(
        'math-rush',
        this.score,
        0, // No WPM for math
        this.getAccuracy(),
        {
          mode: 'expert',
          correct: this.stats.correct,
          wrong: this.stats.wrong,
          maxStreak: this.stats.maxStreak
        }
      );

      this.playerRank = result.rank;
      this.isNewRecord = result.isNewPersonalBest;
      this.newEntryId = result.id;

      // Reload leaderboard
      await this.loadLeaderboard();
    } catch (error: unknown) {
      console.error('Error saving score:', error);
      const err = error as { error?: { message?: string } };
      this.saveError = err.error?.message || 'Impossible d\'enregistrer le score';
    } finally {
      this.savingScore = false;
    }
  }

  getAccuracy(): number {
    const total = this.stats.correct + this.stats.wrong;
    if (total === 0) return 100;
    return Math.round((this.stats.correct / total) * 100);
  }

  getRandomX(): string {
    return Math.random().toFixed(2);
  }

  playAgain(): void {
    this.gameState = 'idle';
  }

  goBack(): void {
    this.clearTimers();
    this.router.navigate(['/playground']);
  }
}
