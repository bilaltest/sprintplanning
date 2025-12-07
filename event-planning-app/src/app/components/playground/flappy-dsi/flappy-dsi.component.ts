import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlaygroundService } from '@services/playground.service';
import { AuthService } from '@services/auth.service';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { LeaderboardEntry } from '@models/game.model';

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

interface Collectible {
  x: number;
  y: number;
  type: 'bonus' | 'malus';
  icon: string;
  label: string;
  collected: boolean;
}

interface Bird {
  y: number;
  velocity: number;
  rotation: number;
}

@Component({
  selector: 'app-flappy-dsi',
  standalone: true,
  imports: [CommonModule, LeaderboardComponent],
  template: `
    <div class="flappy-container">
      <!-- Header -->
      <div class="game-header">
        <button (click)="goBack()" class="back-btn">
          <span class="material-icons">arrow_back</span>
          <span>Retour</span>
        </button>
        <h1 class="game-title">
          <span class="material-icons">flight</span>
          Flappy DSI
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
            [scoreUnit]="'pts'"
            [showWpm]="false"
          ></app-leaderboard>
        </div>

        <!-- Game Panel -->
        <div class="game-panel">
          <!-- Intro Screen -->
          <div *ngIf="gameState === 'idle'" class="intro-screen">
            <div class="intro-card">
              <div class="intro-icon">
                <span class="material-icons">flight</span>
              </div>
              <h2>Flappy DSI</h2>
              <p class="subtitle">Naviguez dans la DSI et collectez des bonus !</p>

              <div class="rules">
                <div class="rule">
                  <span class="material-icons">touch_app</span>
                  <span>Cliquez ou appuyez sur Espace pour voler</span>
                </div>
                <div class="rule">
                  <span class="material-icons">warning</span>
                  <span>Évitez les obstacles</span>
                </div>
                <div class="rule bonus">
                  <span class="material-icons">star</span>
                  <span>Bonus : +3 pts à l'obstacle suivant</span>
                </div>
                <div class="rule malus">
                  <span class="material-icons">dangerous</span>
                  <span>Malus : -1 pt à l'obstacle suivant</span>
                </div>
              </div>

              <button (click)="startGame()" class="start-btn">
                <span class="material-icons">play_arrow</span>
                Commencer
              </button>
            </div>
          </div>

          <!-- Game Canvas -->
          <div
            *ngIf="gameState === 'playing' || gameState === 'finished'"
            class="game-canvas-container"
            (click)="jump()"
            #gameCanvas
          >
            <!-- Sky Background -->
            <div class="sky-bg"></div>

            <!-- Clouds -->
            <div class="clouds">
              <div *ngFor="let cloud of clouds"
                   class="cloud"
                   [style.left.px]="cloud.x"
                   [style.top.px]="cloud.y">
              </div>
            </div>

            <!-- Score Display -->
            <div class="score-display">
              <span class="current-score">{{ score }}</span>
              <div class="modifier-indicator" *ngIf="currentModifier !== 0" [class.bonus]="currentModifier > 0" [class.malus]="currentModifier < 0">
                {{ currentModifier > 0 ? '+' + currentModifier : currentModifier }}
              </div>
            </div>

            <!-- Bird -->
            <div
              class="bird"
              [style.top.px]="bird.y"
              [style.transform]="'rotate(' + bird.rotation + 'deg)'"
            >
              <div class="bird-body">
                <span class="bird-icon">🐦</span>
              </div>
              <div class="bird-wing"></div>
            </div>

            <!-- Pipes -->
            <div *ngFor="let pipe of pipes" class="pipe-pair" [style.left.px]="pipe.x">
              <!-- Top Pipe -->
              <div class="pipe pipe-top" [style.height.px]="pipe.gapY - gapSize/2">
                <div class="pipe-cap"></div>
                <div class="pipe-shine"></div>
              </div>
              <!-- Bottom Pipe -->
              <div class="pipe pipe-bottom" [style.top.px]="pipe.gapY + gapSize/2" [style.height.px]="canvasHeight - (pipe.gapY + gapSize/2)">
                <div class="pipe-cap"></div>
                <div class="pipe-shine"></div>
              </div>
            </div>

            <!-- Collectibles -->
            <div *ngFor="let item of collectibles"
                 class="collectible"
                 [class.bonus]="item.type === 'bonus'"
                 [class.malus]="item.type === 'malus'"
                 [class.collected]="item.collected"
                 [style.left.px]="item.x"
                 [style.top.px]="item.y">
              <span class="material-icons">{{ item.icon }}</span>
            </div>

            <!-- Ground -->
            <div class="ground">
              <div class="ground-pattern"></div>
            </div>

            <!-- Game Over Overlay -->
            <div *ngIf="gameState === 'finished'" class="game-over-overlay">
              <div class="game-over-card">
                <h2>Game Over!</h2>
                <div class="final-score">
                  <span class="score-label">Score</span>
                  <span class="score-value">{{ score }}</span>
                </div>

                <div class="stats-row">
                  <div class="stat">
                    <span class="material-icons text-emerald-500">check_circle</span>
                    <span>{{ obstaclesPassed }} obstacles</span>
                  </div>
                  <div class="stat">
                    <span class="material-icons text-amber-500">star</span>
                    <span>{{ bonusCollected }} bonus</span>
                  </div>
                </div>

                <div *ngIf="isHighScore" class="high-score-badge">
                  <span class="material-icons">star</span>
                  Nouveau record !
                </div>

                <div *ngIf="playerRank && playerRank <= 10" class="rank-info">
                  <span class="material-icons">leaderboard</span>
                  Top {{ playerRank }} !
                </div>

                <div class="game-over-buttons">
                  <button (click)="restartGame()" class="restart-btn">
                    <span class="material-icons">replay</span>
                    Rejouer
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Instructions overlay at start -->
          <div *ngIf="gameState === 'playing' && !gameStarted" class="start-overlay" (click)="jump()">
            <div class="start-message">
              <span class="material-icons bounce">touch_app</span>
              <p>Cliquez pour commencer !</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .flappy-container {
      @apply min-h-screen bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6;
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
      @apply text-3xl text-sky-500;
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

    /* Intro Screen */
    .intro-screen {
      @apply flex items-center justify-center h-full;
    }

    .intro-card {
      @apply bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-md w-full;
    }

    .intro-icon {
      @apply w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center;
    }

    .intro-icon .material-icons {
      @apply text-4xl text-white;
    }

    .intro-card h2 {
      @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
    }

    .intro-card .subtitle {
      @apply text-sky-500 font-medium mb-6;
    }

    .rules {
      @apply space-y-3 mb-6 text-left;
    }

    .rule {
      @apply flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400;
    }

    .rule .material-icons {
      @apply text-sky-500 text-lg;
    }

    .rule.bonus .material-icons {
      @apply text-amber-500;
    }

    .rule.malus .material-icons {
      @apply text-red-500;
    }

    .start-btn {
      @apply flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-600 transition-all transform hover:scale-105;
    }

    /* Game Canvas */
    .game-canvas-container {
      @apply relative w-full h-[600px] rounded-2xl overflow-hidden cursor-pointer select-none;
      background: linear-gradient(180deg, #87CEEB 0%, #E0F4FF 100%);
    }

    .sky-bg {
      @apply absolute inset-0;
      background: linear-gradient(180deg, #4A90D9 0%, #87CEEB 30%, #B4E1FF 100%);
    }

    .clouds {
      @apply absolute inset-0 overflow-hidden pointer-events-none;
    }

    .cloud {
      @apply absolute w-20 h-10 bg-white rounded-full opacity-80;
      box-shadow:
        20px 10px 0 0 white,
        -20px 10px 0 0 white,
        0px -10px 0 0 white;
    }

    .score-display {
      @apply absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center;
    }

    .current-score {
      @apply text-6xl font-black text-white drop-shadow-lg;
      text-shadow: 2px 2px 0 #333, -2px -2px 0 #333, 2px -2px 0 #333, -2px 2px 0 #333;
    }

    .modifier-indicator {
      @apply px-3 py-1 rounded-full text-sm font-bold mt-1;
      animation: pulse 0.5s ease-in-out infinite alternate;
    }

    .modifier-indicator.bonus {
      @apply bg-amber-400 text-amber-900;
    }

    .modifier-indicator.malus {
      @apply bg-red-500 text-white;
    }

    @keyframes pulse {
      from { transform: scale(1); }
      to { transform: scale(1.1); }
    }

    /* Bird */
    .bird {
      @apply absolute w-12 h-12 z-10 transition-transform duration-75;
      left: 100px;
    }

    .bird-body {
      @apply w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      border: 3px solid rgba(255,255,255,0.5);
    }

    .bird-icon {
      filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.3));
    }

    .bird-wing {
      @apply absolute w-4 h-3 rounded-full bg-amber-600;
      left: -5px;
      top: 50%;
      transform: translateY(-50%);
      animation: flap 0.15s ease-in-out infinite alternate;
    }

    @keyframes flap {
      from { transform: translateY(-50%) rotate(-20deg); }
      to { transform: translateY(-50%) rotate(20deg); }
    }

    /* Pipes - Style moderne */
    .pipe-pair {
      @apply absolute w-16;
    }

    .pipe {
      @apply absolute w-full;
      background: linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
      border-radius: 8px;
      box-shadow: inset -4px 0 8px rgba(0,0,0,0.2), 2px 0 4px rgba(0,0,0,0.1);
    }

    .pipe-top {
      @apply top-0;
    }

    .pipe-bottom {
      @apply bottom-0;
    }

    .pipe-cap {
      @apply absolute w-20 h-6 -left-2;
      background: linear-gradient(90deg, #4ade80 0%, #22c55e 50%, #16a34a 100%);
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .pipe-top .pipe-cap {
      @apply bottom-0;
    }

    .pipe-bottom .pipe-cap {
      @apply top-0;
    }

    .pipe-shine {
      @apply absolute top-0 left-1 w-2 h-full opacity-30;
      background: linear-gradient(90deg, white 0%, transparent 100%);
      border-radius: 4px;
    }

    /* Collectibles */
    .collectible {
      @apply absolute w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-200;
      animation: float 1s ease-in-out infinite alternate;
    }

    .collectible.bonus {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      box-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
    }

    .collectible.bonus .material-icons {
      @apply text-white text-xl;
    }

    .collectible.malus {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
    }

    .collectible.malus .material-icons {
      @apply text-white text-xl;
    }

    .collectible.collected {
      transform: scale(1.5);
      opacity: 0;
      transition: all 0.2s ease-out;
    }

    @keyframes float {
      from { transform: translateY(-3px); }
      to { transform: translateY(3px); }
    }

    /* Ground */
    .ground {
      @apply absolute bottom-0 left-0 right-0 h-20 z-10;
      background: linear-gradient(180deg, #8B4513 0%, #654321 100%);
    }

    .ground-pattern {
      @apply absolute top-0 left-0 right-0 h-4;
      background: repeating-linear-gradient(
        90deg,
        #228B22 0px,
        #228B22 20px,
        #32CD32 20px,
        #32CD32 40px
      );
    }

    /* Game Over */
    .game-over-overlay {
      @apply absolute inset-0 bg-black/50 flex items-center justify-center z-30;
    }

    .game-over-card {
      @apply bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl;
      animation: popIn 0.3s ease-out;
    }

    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .game-over-card h2 {
      @apply text-3xl font-black text-gray-900 dark:text-white mb-4;
    }

    .final-score {
      @apply mb-4;
    }

    .final-score .score-label {
      @apply block text-sm text-gray-500 dark:text-gray-400;
    }

    .final-score .score-value {
      @apply text-5xl font-black text-sky-500;
    }

    .stats-row {
      @apply flex justify-center gap-6 mb-4;
    }

    .stat {
      @apply flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400;
    }

    .high-score-badge {
      @apply flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full font-bold mb-4;
    }

    .rank-info {
      @apply flex items-center justify-center gap-2 text-sky-600 dark:text-sky-400 font-medium mb-4;
    }

    .game-over-buttons {
      @apply flex gap-3;
    }

    .restart-btn {
      @apply flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-600 transition-all;
    }

    /* Start Overlay */
    .start-overlay {
      @apply absolute inset-0 flex items-center justify-center z-20 bg-black/20;
    }

    .start-message {
      @apply text-center text-white;
    }

    .start-message .material-icons {
      @apply text-6xl;
    }

    .start-message p {
      @apply text-xl font-bold mt-2;
      text-shadow: 2px 2px 0 #333;
    }

    .bounce {
      animation: bounce 1s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
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
export class FlappyDsiComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas') gameCanvas!: ElementRef;

  gameState: 'idle' | 'playing' | 'finished' = 'idle';
  gameStarted = false;
  score = 0;

  // Canvas dimensions
  canvasWidth = 800;
  canvasHeight = 600;
  groundHeight = 80;

  // Bird
  bird: Bird = { y: 250, velocity: 0, rotation: 0 };
  gravity = 0.5;
  jumpStrength = -8;
  birdSize = 48;

  // Pipes
  pipes: Pipe[] = [];
  pipeWidth = 64;
  gapSize = 150;
  pipeSpeed = 3;
  pipeSpawnInterval = 1800;

  // Collectibles
  collectibles: Collectible[] = [];
  collectibleSize = 40;

  // Bonus/Malus types
  bonusTypes = [
    { icon: 'trending_up', label: 'Augmentation' }
  ];
  malusTypes = [
    { icon: 'cloud_off', label: 'Env KO' }
  ];

  // Current modifier for next obstacle
  currentModifier = 0; // 0 = normal (+1), positive = bonus, negative = malus

  // Stats
  obstaclesPassed = 0;
  bonusCollected = 0;

  // Clouds
  clouds: { x: number; y: number }[] = [];

  // Leaderboard
  leaderboard: LeaderboardEntry[] = [];
  loadingLeaderboard = true;
  newEntryId: string | null = null;
  playerRank: number | null = null;
  isHighScore = false;

  private gameLoop: number | null = null;
  private pipeSpawner: ReturnType<typeof setInterval> | null = null;

  constructor(
    private router: Router,
    private playgroundService: PlaygroundService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLeaderboard();
    this.initClouds();
  }

  ngOnDestroy(): void {
    this.stopGame();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.preventDefault();
      if (this.gameState === 'idle') {
        this.startGame();
      } else if (this.gameState === 'playing') {
        this.jump();
      }
    }
  }

  async loadLeaderboard(): Promise<void> {
    this.loadingLeaderboard = true;
    try {
      this.leaderboard = await this.playgroundService.getLeaderboard('flappy-dsi');
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      this.loadingLeaderboard = false;
    }
  }

  initClouds(): void {
    this.clouds = [];
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * 200 + 20
      });
    }
  }

  startGame(): void {
    this.gameState = 'playing';
    this.gameStarted = false;
    this.score = 0;
    this.currentModifier = 0;
    this.obstaclesPassed = 0;
    this.bonusCollected = 0;
    this.bird = { y: 250, velocity: 0, rotation: 0 };
    this.pipes = [];
    this.collectibles = [];
    this.newEntryId = null;
    this.playerRank = null;
    this.isHighScore = false;
  }

  jump(): void {
    if (this.gameState !== 'playing') return;

    if (!this.gameStarted) {
      this.gameStarted = true;
      this.startGameLoop();
    }

    this.bird.velocity = this.jumpStrength;
  }

  private startGameLoop(): void {
    // Start spawning pipes
    this.spawnPipe();
    this.pipeSpawner = setInterval(() => this.spawnPipe(), this.pipeSpawnInterval);

    // Start game loop
    const loop = () => {
      if (this.gameState !== 'playing') return;

      this.update();
      this.gameLoop = requestAnimationFrame(loop);
    };
    this.gameLoop = requestAnimationFrame(loop);
  }

  private spawnPipe(): void {
    const minGapY = 100 + this.gapSize / 2;
    const maxGapY = this.canvasHeight - this.groundHeight - 100 - this.gapSize / 2;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

    this.pipes.push({
      x: this.canvasWidth,
      gapY,
      passed: false
    });

    // Spawn collectible between pipes (50% chance)
    if (Math.random() < 0.5) {
      this.spawnCollectible();
    }
  }

  private spawnCollectible(): void {
    const isBonus = Math.random() < 0.6; // 60% chance bonus, 40% malus
    const types = isBonus ? this.bonusTypes : this.malusTypes;
    const type = types[Math.floor(Math.random() * types.length)];

    // Position between current pipe spawn and next
    const x = this.canvasWidth + this.pipeSpawnInterval * this.pipeSpeed / 1000 / 2;
    const minY = 80;
    const maxY = this.canvasHeight - this.groundHeight - 80;
    const y = Math.random() * (maxY - minY) + minY;

    this.collectibles.push({
      x,
      y,
      type: isBonus ? 'bonus' : 'malus',
      icon: type.icon,
      label: type.label,
      collected: false
    });
  }

  private update(): void {
    // Update bird
    this.bird.velocity += this.gravity;
    this.bird.y += this.bird.velocity;
    this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -30), 90);

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      this.pipes[i].x -= this.pipeSpeed;

      // Check if pipe passed
      if (!this.pipes[i].passed && this.pipes[i].x + this.pipeWidth < 100) {
        this.pipes[i].passed = true;
        this.obstaclesPassed++;

        // Apply score with modifier
        if (this.currentModifier > 0) {
          this.score += this.currentModifier;
          this.bonusCollected++;
        } else if (this.currentModifier < 0) {
          this.score = Math.max(0, this.score + this.currentModifier);
        } else {
          this.score += 1;
        }

        // Reset modifier after use
        this.currentModifier = 0;
      }

      // Remove off-screen pipes
      if (this.pipes[i].x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
      }
    }

    // Update collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      this.collectibles[i].x -= this.pipeSpeed;

      // Check collision with bird
      if (!this.collectibles[i].collected) {
        const dx = (this.collectibles[i].x + this.collectibleSize / 2) - (100 + this.birdSize / 2);
        const dy = (this.collectibles[i].y + this.collectibleSize / 2) - (this.bird.y + this.birdSize / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (this.collectibleSize + this.birdSize) / 2) {
          this.collectibles[i].collected = true;

          if (this.collectibles[i].type === 'bonus') {
            this.currentModifier = 3;
          } else {
            this.currentModifier = -1;
          }
        }
      }

      // Remove off-screen or collected collectibles
      if (this.collectibles[i].x + this.collectibleSize < 0 ||
          (this.collectibles[i].collected && this.collectibles[i].x < 100)) {
        this.collectibles.splice(i, 1);
      }
    }

    // Update clouds
    for (const cloud of this.clouds) {
      cloud.x -= 0.5;
      if (cloud.x < -80) {
        cloud.x = this.canvasWidth + 80;
        cloud.y = Math.random() * 200 + 20;
      }
    }

    // Check collisions
    this.checkCollisions();
  }

  private checkCollisions(): void {
    const birdLeft = 100;
    const birdRight = birdLeft + this.birdSize;
    const birdTop = this.bird.y;
    const birdBottom = this.bird.y + this.birdSize;

    // Ground collision
    if (birdBottom >= this.canvasHeight - this.groundHeight) {
      this.endGame();
      return;
    }

    // Ceiling collision
    if (birdTop <= 0) {
      this.bird.y = 0;
      this.bird.velocity = 0;
    }

    // Pipe collision
    for (const pipe of this.pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + this.pipeWidth;

      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        const gapTop = pipe.gapY - this.gapSize / 2;
        const gapBottom = pipe.gapY + this.gapSize / 2;

        if (birdTop < gapTop || birdBottom > gapBottom) {
          this.endGame();
          return;
        }
      }
    }
  }

  private async endGame(): Promise<void> {
    this.gameState = 'finished';
    this.stopGame();

    // Save score
    try {
      const result = await this.playgroundService.submitScore(
        'flappy-dsi',
        this.score,
        0,
        100,
        {
          obstaclesPassed: this.obstaclesPassed,
          bonusCollected: this.bonusCollected
        }
      );

      this.playerRank = result.rank;
      this.isHighScore = result.isNewPersonalBest;
      this.newEntryId = result.id;

      await this.loadLeaderboard();
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }

  private stopGame(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
    if (this.pipeSpawner) {
      clearInterval(this.pipeSpawner);
      this.pipeSpawner = null;
    }
  }

  restartGame(): void {
    this.startGame();
  }

  goBack(): void {
    this.stopGame();
    this.router.navigate(['/playground']);
  }
}
