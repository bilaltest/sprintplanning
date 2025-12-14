import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlaygroundService } from '@services/playground.service';

type GameState = 'INTRO' | 'ENEMY_TURN' | 'PLAYER_ACTION_REQUIRED' | 'QTE_PHASE' | 'GAME_OVER';
type ParryResult = 'PERFECT' | 'GOOD' | 'MISS';

interface QTEKey {
  key: string;   // 'A', 'Z', 'E', 'R' etc.
  status: 'PENDING' | 'SUCCESS' | 'FAIL';
}

@Component({
  selector: 'app-synchro-combat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="synchro-container">
      <!-- Background Ambience -->
      <div class="ambient-bg"></div>
      <div class="particles" #particlesContainer></div>

      <!-- Header / HUD -->
      <div class="hud-layer">
        <button (click)="goBack()" class="back-btn">
          <span class="material-icons">arrow_back</span>
          <span class="hidden sm:inline">Retour</span>
        </button>

        <div class="score-board">
          <div class="score-label">SCORE</div>
          <div class="score-value">{{ score | number:'1.0-0' }}</div>
          <div class="multiplier" [class.active]="multiplier > 1">x{{ multiplier.toFixed(1) }}</div>
        </div>
      </div>

      <!-- Main Game Area -->
      <div class="game-stage" [class.shaking]="screenshake">
        
        <!-- ENEMY (Top Right) -->
        <div class="enemy-container">
          <div class="enemy-hud">
             <div class="enemy-name">La Peintresse</div>
             <div class="health-bar-track">
                <div class="health-bar-fill" style="width: 100%"></div> <!-- Decoration only for now -->
             </div>
          </div>
          <div class="enemy-sprite" [class.attacking]="gameState === 'ENEMY_TURN'" [class.hit]="enemyHitAnim">
             <img src="/assets/images/synchro/enemy.png" class="enemy-img" alt="Enemy">
             <div class="enemy-aura"></div>
          </div>

        <!-- PLAYER (Bottom Left) -->
        <div class="player-container">
            <div class="player-hud" style="margin-bottom: 1rem;">
               <!-- Player Health -->
                <div class="health-bar-container">
                  <span class="material-icons health-icon">favorite</span>
                  <div class="health-bar-track">
                    <div class="health-bar-fill" [style.width.%]="(health / maxHealth) * 100"></div>
                  </div>
                </div>
            </div>
            <div class="player-sprite">
                <img src="/assets/images/synchro/hero.png" class="hero-img" alt="Hero">
            </div>
        </div>

        <!-- Central Action Zone (Overlay) -->
        <div class="action-zone">
          
          <!-- INTRO SCREEN -->
          <div *ngIf="gameState === 'INTRO'" class="intro-screen">
            <h1 class="game-title">Synchro Combat</h1>
            <p class="game-subtitle">Inspiré de <em>Clair Obscur: Expedition 33</em></p>
            
            <div class="tutorial">
              <div class="tut-step">
                <span class="key">SPACE</span>
                <span>Parer au bon moment</span>
              </div>
              <div class="tut-step">
                <span class="key">A</span><span class="key">Z</span> - <span class="key">Q</span><span class="key">S</span><span class="key">D</span>
                <span>Enchaîner les QTE</span>
              </div>
            </div>

            <button class="start-btn" (click)="startGame()">
              <span>Commencer l'Expédition</span>
              <div class="btn-shine"></div>
            </button>
          </div>

          <!-- ATTACK BAR (The "Cast Bar") -->
          <div *ngIf="gameState === 'ENEMY_TURN' || gameState === 'PLAYER_ACTION_REQUIRED'" class="attack-track">
            <div class="track-line"></div>
            <div class="perfect-zone" [style.left.%]="perfectZoneStart" [style.width.%]="perfectZoneWidth"></div>
            <div class="good-zone" [style.left.%]="goodZoneStart" [style.width.%]="goodZoneWidth"></div>
            
            <div class="cursor-marker" [style.left.%]="cursorPosition">
              <div class="cursor-diamond"></div>
            </div>

            <div class="prompt-text" [class.visible]="gameState === 'ENEMY_TURN'">
              PRÉPAREZ-VOUS...
            </div>
          </div>

          <!-- FEEDBACK TEXT -->
          <div *ngIf="feedbackText" class="feedback-text" [ngClass]="feedbackClass">
            {{ feedbackText }}
          </div>

          <!-- QTE DISPLAY -->
          <div *ngIf="gameState === 'QTE_PHASE'" class="qte-container">
            <div class="qte-timer-bar">
               <div class="qte-timer-fill" [style.width.%]="qteTimerPct"></div>
            </div>
            <div class="qte-keys">
              @for (qte of currentQTEs; track $index) {
                <div class="qte-key" 
                     [class.success]="qte.status === 'SUCCESS'"
                     [class.fail]="qte.status === 'FAIL'"
                     [class.pending]="qte.status === 'PENDING'">
                  <span>{{ qte.key }}</span>
                </div>
              }
            </div>
          </div>

          <!-- GAME OVER -->
          <div *ngIf="gameState === 'GAME_OVER'" class="game-over-screen">
            <h2>Expédition Échouée</h2>
            <div class="final-score">
              <span>Score Final</span>
              <strong>{{ score | number:'1.0-0' }}</strong>
            </div>
            <div class="stats">
              <div>Parades Parfaites: {{ stats.perfects }}</div>
              <div>Max Combo: {{ stats.maxCombo }}</div>
            </div>
            <button class="start-btn" (click)="startGame()">
              <span>Retenter</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* -------------------------------------------------------------------------- */
    /*                                 THEME & BASE                               */
    /* -------------------------------------------------------------------------- */
    :host {
      --color-bg-dark: #0f1115;
      --color-gold: #cfb582;
      --color-gold-dim: #6e5f40;
      --color-hit: #ff3e3e; /* Paint Red */
      --color-perfect: #5eead4; /* Cyan/Teal glow */
      --color-ui-bg: rgba(20, 22, 28, 0.9);
      --font-serif: 'Times New Roman', serif;
      
      display: block;
      height: 100vh;
      overflow: hidden;
      font-family: var(--font-serif);
      color: #e5e5e5;
      background-color: var(--color-bg-dark);
    }

    .synchro-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .ambient-bg {
      position: absolute;
      inset: 0;
      background-image: url('/assets/images/synchro/bg.png');
      background-size: cover;
      background-position: center;
      opacity: 0.8;
      z-index: 0;
      filter: brightness(0.7) contrast(1.2);
    }

    .particles {
      position: absolute;
      inset: 0;
      z-index: 5;
      pointer-events: none;
      overflow: hidden;
    }
    /* Global particle style (added dynamically) but we can define base if needed */
    ::ng-deep .particle {
      position: absolute;
      top: 100%; /* Start below */
      background: rgba(207, 181, 130, 0.4); /* Goldish dust */
      border-radius: 50%;
      box-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
      pointer-events: none;
    }
    
    @keyframes rise {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 0.6; }
      90% { opacity: 0.4; }
      100% { transform: translateY(-120vh) translateX(30px); opacity: 0; }
    }

    /* -------------------------------------------------------------------------- */
    /*                                     HUD                                    */
    /* -------------------------------------------------------------------------- */
    .hud-layer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      pointer-events: none;
    }

    .back-btn {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid var(--color-gold);
      color: var(--color-gold);
      padding: 0.75rem 1.25rem;
      border-radius: 4px;
      font-family: var(--font-serif);
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
    }
    .back-btn:hover {
      background: rgba(207, 181, 130, 0.2);
    }

    .score-board {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(0,0,0,0.5);
      padding: 10px 20px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(5px);
    }
    .score-label {
      font-size: 0.75rem;
      letter-spacing: 3px;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
    }
    .score-value {
      font-size: 2.5rem;
      line-height: 1;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 0 10px rgba(255,255,255,0.5);
    }
    .multiplier {
      font-size: 1.2rem;
      color: var(--color-gold);
      font-weight: bold;
      opacity: 0.5;
      transition: opacity 0.3s;
    }
    .multiplier.active {
      opacity: 1;
      text-shadow: 0 0 10px var(--color-gold);
    }

    .health-bar-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .health-icon {
      color: var(--color-hit);
      animation: beat 2s infinite;
      text-shadow: 0 0 10px var(--color-hit);
    }
    .health-bar-track {
      width: 200px;
      height: 8px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .health-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #d32f2f, #ef5350);
      transition: width 0.3s ease-out;
      box-shadow: 0 0 10px rgba(239, 83, 80, 0.5);
    }

    @keyframes beat {
      0%, 100% { transform: scale(1); }
      15% { transform: scale(1.2); }
      30% { transform: scale(1); }
    }

    /* -------------------------------------------------------------------------- */
    /*                                 GAME STAGE                                 */
    /* -------------------------------------------------------------------------- */
    .game-stage {
      position: absolute;
      inset: 0;
      z-index: 10;
      perspective: 1000px;
      overflow: hidden;
    }
    .game-stage.shaking {
      animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
    }

    @keyframes shake {
      10%, 90% { transform: translate3d(-2px, 2px, 0); }
      20%, 80% { transform: translate3d(2px, -2px, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 1px, 0); }
      40%, 60% { transform: translate3d(4px, -3px, 0); }
    }

    /* BATTLE LAYOUT (Pokemon Style) */
    
    /* ENEMY (Top Right / Center) */
    .enemy-container {
      position: absolute;
      top: 15%;
      right: 20%;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 20;
    }
    
    .enemy-hud {
      margin-bottom: 2rem;
      background: rgba(0,0,0,0.6);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border-left: 4px solid var(--color-hit);
      backdrop-filter: blur(4px);
    }
    .enemy-name {
      font-size: 1.2rem;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 0.25rem;
    }

    .enemy-sprite {
      position: relative;
      width: 300px;
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      animation: float 4s ease-in-out infinite;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .enemy-sprite.attacking {
       transform: scale(1.2) translateX(-50px);
       filter: brightness(1.2);
    }
    .enemy-sprite.hit {
      filter: brightness(2) drop-shadow(0 0 20px red) grayscale(0.5);
      transform: scale(0.9) translateX(20px);
      animation: flashHit 0.2s;
    }
    .enemy-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 10px 20px rgba(0,0,0,0.6));
    }
    .enemy-aura {
      position: absolute;
      inset: -20px;
      background: radial-gradient(circle, transparent 30%, rgba(207, 181, 130, 0.1) 70%);
      border-radius: 50%;
      filter: blur(10px);
      z-index: -1;
      animation: rotateAura 10s linear infinite;
    }

    /* PLAYER (Bottom Left) */
    .player-container {
      position: absolute;
      bottom: 5%;
      left: 10%;
      z-index: 30;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .player-sprite {
      width: 350px;
      height: 350px;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      animation: breathe 4s ease-in-out infinite;
    }
    .hero-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 15px rgba(0,0,0,0.5));
    }

    /* ACTION ZONE (Center / Top Overlay) */
    .action-zone {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      max-width: 800px;
      z-index: 40;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
    }

    /* ATTACK TRACK */
    .attack-track {
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.1);
      position: relative;
      margin-top: 2rem;
      border-radius: 2px;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    }
    .track-line {
      position: absolute;
      inset: 0; 
      background: rgba(0,0,0,0.5);
    }
    .perfect-zone {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: 20px;
      background: var(--color-gold);
      box-shadow: 0 0 15px var(--color-gold);
      z-index: 2;
      border-radius: 2px;
    }
    .good-zone {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: 12px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
    }

    .cursor-marker {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 30px;
      z-index: 5;
      filter: drop-shadow(0 0 5px #000);
    }
    .cursor-diamond {
      width: 100%;
      height: 100%;
      background: #fff;
      transform: rotate(45deg);
      border: 2px solid #000;
    }

    .prompt-text {
      position: absolute;
      top: -60px;
      width: 100%;
      text-align: center;
      font-size: 1.5rem;
      letter-spacing: 4px;
      color: #fff;
      text-shadow: 0 2px 10px rgba(0,0,0,0.8);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .prompt-text.visible { opacity: 1; }

    /* FEEDBACK & INTRO */
    .intro-screen, .game-over-screen {
      pointer-events: auto;
      text-align: center;
      background: rgba(15, 17, 21, 0.95);
      padding: 3rem;
      border: 2px solid var(--color-gold-dim);
      border-radius: 8px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.8);
      max-width: 500px;
    }
    .game-title {
      font-size: 3.5rem;
      color: #fff;
      text-shadow: 0 0 20px rgba(207, 181, 130, 0.4);
      margin-bottom: 0.5rem;
    }
    .game-subtitle {
     color: var(--color-gold);
     font-size: 1.2rem;
     margin-bottom: 2rem;
     font-style: italic;
    }
    
    .tutorial {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
      text-align: left;
    }
    .tut-step {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #ccc;
    }
    .key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      padding: 0 6px;
      background: #333;
      border: 1px solid #666;
      border-radius: 4px;
      color: #fff;
      font-weight: bold;
      font-family: sans-serif;
      box-shadow: 0 2px 0 #111;
    }

    .start-btn {
      background: transparent;
      border: 1px solid var(--color-gold);
      color: var(--color-gold);
      padding: 1rem 3rem;
      font-size: 1.2rem;
      font-family: var(--font-serif);
      text-transform: uppercase;
      cursor: pointer;
      overflow: hidden;
      position: relative;
      transition: all 0.3s;
      width: 100%;
    }
    .start-btn:hover {
      background: var(--color-gold);
      color: #000;
      box-shadow: 0 0 30px var(--color-gold-dim);
    }
    
    .feedback-text {
      position: absolute;
      top: -150px;
      font-size: 4rem;
      font-weight: bold;
      letter-spacing: 2px;
      z-index: 100;
      text-shadow: 0 4px 10px rgba(0,0,0,0.5);
      animation: popup 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      pointer-events: none;
      white-space: nowrap;
    }
    .feedback-text.perfect { color: var(--color-perfect); }
    .feedback-text.good { color: #fff; }
    .feedback-text.miss { color: var(--color-hit); }

    /* QTE */
    .qte-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      transform: scale(1.2);
    }
    .qte-keys {
      display: flex;
      gap: 1rem;
    }
    .qte-key {
      width: 60px; 
      height: 60px;
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
      color: #fff;
      background: rgba(0,0,0,0.5);
      transform: rotate(45deg);
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    .qte-key span { transform: rotate(-45deg); }
    .qte-key.success {
      border-color: var(--color-perfect);
      background: rgba(94, 234, 212, 0.4);
      box-shadow: 0 0 30px var(--color-perfect);
    }
    .qte-key.fail {
       border-color: var(--color-hit);
       background: rgba(255, 62, 62, 0.4);
    }
    .qte-timer-bar {
      width: 300px;
      height: 6px;
      background: rgba(255,255,255,0.2);
      border-radius: 3px;
    }
    .qte-timer-fill {
      height: 100%;
      background: #fff;
      box-shadow: 0 0 10px #fff;
    }

    /* ANIMATIONS */
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
    @keyframes breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    @keyframes popup {
      0% { opacity: 0; transform: translateY(20px) scale(0.5); }
      50% { opacity: 1; transform: translateY(-10px) scale(1.2); }
      100% { opacity: 0; transform: translateY(-40px) scale(1.0); }
    }
    @keyframes btnShine {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    @keyframes rotateAura {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class SynchroCombatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('particlesContainer') particlesContainer!: ElementRef<HTMLDivElement>;

  gameState: GameState = 'INTRO';

  // Scoring & Stats
  score = 0;
  multiplier = 1;
  maxHealth = 100;
  health = 100;
  stats = { perfects: 0, maxCombo: 0 };

  // Game Loop Props
  private lastTime = 0;
  private animationFrameId: number | null = null;

  // Attack Props
  attackDuration = 2000; // ms
  attackStartTime = 0;
  cursorPosition = 0; // 0-100%

  // Difficulty Scaling
  speedMultiplier = 1;

  // Zones (in %)
  perfectZoneStart = 75; // The "hit" point is ideally around 80-90%
  perfectZoneWidth = 5;
  goodZoneStart = 70;
  goodZoneWidth = 15;

  // QTE Props
  currentQTEs: QTEKey[] = [];
  qteIndex = 0;
  qteTimer = 0;
  qteMaxTime = 0;

  // Visuals
  screenshake = false;
  enemyHitAnim = false;
  feedbackText: string | null = null;
  feedbackClass = '';

  constructor(private router: Router) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.createParticles();
  }

  createParticles(): void {
    if (!this.particlesContainer) return;
    const container = this.particlesContainer.nativeElement;
    // Clear existing
    container.innerHTML = '';

    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');

      // Random properties
      const size = Math.random() * 3 + 1; // 1-4px
      const left = Math.random() * 100;
      const duration = Math.random() * 15 + 10; // 10-25s
      const delay = Math.random() * -20; // Start at random point in cycle
      const opacity = Math.random() * 0.5 + 0.1;

      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${left}%`;
      p.style.opacity = `${opacity}`;
      p.style.animation = `rise ${duration}s linear ${delay}s infinite`;

      container.appendChild(p);
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  goBack(): void {
    this.router.navigate(['/playground']);
  }

  // --------------------------------------------------------------------------
  // GAME LOOP
  // --------------------------------------------------------------------------

  startGame(): void {
    this.gameState = 'ENEMY_TURN';
    this.resetGame();
    this.startTurn();

    // Start loop
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  resetGame(): void {
    this.score = 0;
    this.health = 100;
    this.multiplier = 1;
    this.speedMultiplier = 1;
    this.stats = { perfects: 0, maxCombo: 0 };
  }

  startTurn(): void {
    this.gameState = 'ENEMY_TURN';
    // Randomize speed slightly
    const baseDuration = Math.max(800, 2000 - (this.multiplier * 50));
    this.attackDuration = baseDuration;
    this.attackStartTime = performance.now();

    // Randomize zones slightly
    const center = 75 + (Math.random() * 10 - 5);
    this.perfectZoneWidth = Math.max(2, 6 - (this.multiplier * 0.2)); // Shrinks with combo
    this.perfectZoneStart = center - (this.perfectZoneWidth / 2);

    this.goodZoneWidth = this.perfectZoneWidth * 4;
    this.goodZoneStart = center - (this.goodZoneWidth / 2);

    this.cursorPosition = 0;
  }

  gameLoop(timestamp: number): void {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (this.gameState === 'ENEMY_TURN') {
      const elapsed = timestamp - this.attackStartTime;
      const progress = elapsed / this.attackDuration;

      this.cursorPosition = progress * 100;

      // Check if missed (went past 100%)
      if (progress >= 1.05) { // Little buffer
        this.resolveParry('MISS');
      }
    } else if (this.gameState === 'QTE_PHASE') {
      this.qteTimer -= deltaTime;
      if (this.qteTimer <= 0) {
        this.failQTE();
      }
    }

    if (this.gameState !== 'GAME_OVER') {
      this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  // --------------------------------------------------------------------------
  // INPUT HANDLING
  // --------------------------------------------------------------------------

  @HostListener('window:keydown', ['$event'])
  handleInput(event: KeyboardEvent): void {
    if (event.repeat) return;

    // Normalize key
    const key = event.key.toUpperCase();

    if (key === ' ' && this.gameState === 'ENEMY_TURN') {
      this.checkParryTiming();
    } else if (this.gameState === 'QTE_PHASE') {
      this.checkQTEInput(key);
    }
  }

  @HostListener('mousedown')
  handleMouse(): void {
    if (this.gameState === 'ENEMY_TURN') {
      this.checkParryTiming();
    }
  }

  checkParryTiming(): void {
    // Logic: Compare cursorPosition with zones
    const pos = this.cursorPosition;

    // Check ranges
    const perfectStart = this.perfectZoneStart;
    const perfectEnd = perfectStart + this.perfectZoneWidth;

    const goodStart = this.goodZoneStart;
    const goodEnd = goodStart + this.goodZoneWidth;

    if (pos >= perfectStart && pos <= perfectEnd) {
      this.resolveParry('PERFECT');
    } else if (pos >= goodStart && pos <= goodEnd) {
      this.resolveParry('GOOD');
    } else {
      this.resolveParry('MISS');
    }
  }

  resolveParry(result: ParryResult): void {
    if (result === 'PERFECT') {
      this.showFeedback('PARFAIT !', 'perfect');
      this.score += 500 * this.multiplier;
      this.stats.perfects++;
      this.multiplier += 0.5;
      this.triggerHitEffect();

      // Trigger QTE Phase
      this.startQTEPhase();

    } else if (result === 'GOOD') {
      this.showFeedback('BIEN', 'good');
      this.score += 100 * this.multiplier;
      // Good parry doesn't increase multiplier much, but maintains it
      this.triggerHitEffect(true);
      // Immediately next turn (no QTE)
      setTimeout(() => this.startTurn(), 500);

    } else {
      this.showFeedback('RATÉ...', 'miss');
      this.takeDamage(20);
      this.multiplier = 1;
      this.screenshake = true;
      setTimeout(() => this.screenshake = false, 400);

      if (this.health > 0) {
        setTimeout(() => this.startTurn(), 800);
      }
    }
  }

  // --------------------------------------------------------------------------
  // QTE MECHANIC
  // --------------------------------------------------------------------------

  startQTEPhase(): void {
    this.gameState = 'QTE_PHASE';

    // Generate sequence based on difficulty/multiplier
    const length = Math.min(3 + Math.floor(this.multiplier / 2), 6);
    this.currentQTEs = [];
    const keys = ['A', 'Z', 'E', 'R', 'S', 'D']; // Common FPS/MOBA keys

    for (let i = 0; i < length; i++) {
      this.currentQTEs.push({
        key: keys[Math.floor(Math.random() * keys.length)],
        status: 'PENDING'
      });
    }

    this.qteIndex = 0;
    this.qteMaxTime = 2000; // 2 seconds total for sequence? or per key? Let's do total.
    this.qteTimer = this.qteMaxTime;
  }

  checkQTEInput(key: string): void {
    if (this.qteIndex >= this.currentQTEs.length) return;

    const target = this.currentQTEs[this.qteIndex];

    if (key === target.key) {
      target.status = 'SUCCESS';
      this.qteIndex++;
      this.score += 50 * this.multiplier;

      // Check if complete
      if (this.qteIndex >= this.currentQTEs.length) {
        this.successQTE();
      }
    } else {
      // Wrong key
      target.status = 'FAIL';
      this.failQTE();
    }
  }

  successQTE(): void {
    this.showFeedback('ENCHAÎNEMENT !', 'perfect');
    this.score += 1000 * this.multiplier;
    this.multiplier += 1;
    this.gameState = 'PLAYER_ACTION_REQUIRED'; // Temp state to block input
    this.triggerHitEffect();

    // Back to enemy turn
    setTimeout(() => this.startTurn(), 600);
  }

  failQTE(): void {
    this.showFeedback('BRISÉ...', 'miss');
    this.multiplier = Math.max(1, this.multiplier - 1);
    this.gameState = 'PLAYER_ACTION_REQUIRED';
    setTimeout(() => this.startTurn(), 600);
  }

  get qteTimerPct(): number {
    return Math.max(0, (this.qteTimer / this.qteMaxTime) * 100);
  }

  // --------------------------------------------------------------------------
  // UTILS & EFFECTS
  // --------------------------------------------------------------------------

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.endGame();
    }
  }

  endGame(): void {
    this.gameState = 'GAME_OVER';
    if (this.multiplier > this.stats.maxCombo) this.stats.maxCombo = this.multiplier;
  }

  triggerHitEffect(minor = false): void {
    this.enemyHitAnim = true;
    setTimeout(() => this.enemyHitAnim = false, minor ? 100 : 300);
  }

  showFeedback(text: string, cls: string): void {
    this.feedbackText = text;
    this.feedbackClass = cls;
    // Clear after animation
    setTimeout(() => {
      if (this.feedbackText === text) {
        this.feedbackText = null;
      }
    }, 600);
  }
}
