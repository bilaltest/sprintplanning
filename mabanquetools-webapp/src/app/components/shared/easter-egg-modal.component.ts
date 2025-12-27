
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger, keyframes } from '@angular/animations';
import { AuthService } from '@services/auth.service';

type Stage = 'HIDDEN' | 'PROFESSOR' | 'TRANSITION' | 'BATTLE' | 'CAUGHT';

@Component({
  selector: 'app-easter-egg-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="stage !== 'HIDDEN'" class="fixed inset-0 z-[9999] overflow-hidden font-mono" [ngClass]="{'bg-[#f0f9ff]': stage === 'PROFESSOR', 'bg-white': stage === 'BATTLE'}">
      
      <!-- STAGE 1: PROFESSOR INTRO -->
      <div *ngIf="stage === 'PROFESSOR'" class="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in relative">
        
        <!-- Professor Sprite -->
        <div class="mb-8 relative">
           <div class="w-48 h-48 bg-gray-200 rounded-full border-4 border-gray-800 flex items-center justify-center overflow-hidden relative shadow-xl">
               <img src="assets/images/Professeur_Chen.png" alt="Professeur Chen" class="w-full h-full object-cover object-top">
           </div>
           <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 border-2 border-gray-800 rounded-full font-bold shadow-md whitespace-nowrap z-10">
               Prof. Chen
           </div>
        </div>

        <!-- Dialogue Box -->
        <div class="max-w-2xl bg-white border-4 border-blue-900 rounded-lg p-6 shadow-xl text-left relative">
           <!-- Decorative corner -->
           <div class="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-blue-900"></div>
           <div class="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-blue-900"></div>
           <div class="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-blue-900"></div>
           <div class="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-blue-900"></div>

           <p class="text-xl md:text-2xl text-gray-800 mb-6 font-bold leading-relaxed" style="font-family: 'Courier New', monospace;">
             "Hola ! Je détecte une frénésie de clics anormale...<br>
             Ton aura de développeur est ultra puissante !"
           </p>
           
           <div class="flex justify-end gap-4">
             <button (click)="startBattle()" class="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold border-b-4 border-blue-800 rounded active:border-b-0 active:translate-y-1 transition-all">
               C'EST PARTI !
             </button>
             <button (click)="close()" class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-600 text-xl font-bold border-b-4 border-gray-400 rounded active:border-b-0 active:translate-y-1 transition-all">
               PLUS TARD
             </button>
           </div>
        </div>
      </div>

      <!-- STAGE 2: TRANSITION (Flash) -->
      <div *ngIf="stage === 'TRANSITION'" class="h-full w-full bg-black flex items-center justify-center">
        <div class="battle-transition"></div>
      </div>

      <!-- STAGE 3: POKEMON BATTLE -->
      <div *ngIf="stage === 'BATTLE' || stage === 'CAUGHT'" class="h-full w-full bg-[#f8f8f8] relative font-sans">
        
        <!-- BATTLE SCENE -->
        <div class="h-[60%] w-full relative bg-cover bg-center border-b-4 border-black box-content" style="background-image: url('assets/images/pokemon_battle_bg.png');">
           <!-- ENEMY HUD -->
           <div class="absolute top-10 left-10 bg-[#f8f8f8] border-4 border-gray-700 rounded-lg p-4 shadow-lg w-72 z-10">
             <div class="flex justify-between items-baseline mb-1">
               <span class="font-bold text-xl uppercase text-gray-800">PLAYGROUND</span>
               <span class="text-sm font-bold text-gray-800">Lv.99</span>
             </div>
             <div class="w-full bg-gray-300 h-4 rounded-full border-2 border-gray-500 overflow-hidden relative">
               <div class="h-full bg-green-500 w-full"></div>
               <div class="absolute top-0 left-2 text-[8px] font-bold text-white tracking-widest">HP</div>
             </div>
           </div>

           <!-- ENEMY SPRITE (Top Right) -->
           <div class="absolute right-10 md:right-32 top-12 animate-bounce-custom transition-opacity duration-500"
                [ngClass]="{'opacity-0': throwState === 'SHAKING' || throwState === 'CAUGHT'}">
             <div class="w-80 h-80 flex items-center justify-center relative">
                <img src="assets/images/playground_monster.png" alt="Playground Monster" class="w-full h-full object-contain filter drop-shadow-2xl">
             </div>
             <div class="absolute -bottom-4 left-10 w-60 h-8 bg-black opacity-20 rounded-[100%] blur-md"></div>
           </div>
           
           <!-- PLAYER SPRITE (Bottom Left) -->
           <div class="absolute left-10 md:left-32 -bottom-0 z-20 transition-all duration-1000" [ngClass]="{'translate-x-[-500px]': throwState !== 'NONE'}">
              <div class="w-64 h-64 relative">
                 <img src="assets/images/asset_sacha.png" alt="Dresseur" class="w-full h-full object-contain">
              </div>
           </div>

           <!-- POKEBALL THROW ANIMATION -->
            <div *ngIf="throwState !== 'NONE'" 
                 class="absolute left-32 bottom-32 z-30 pointer-events-none"
                 [ngClass]="{
                    'animate-throw': throwState === 'THROWING',
                    'caught-position': throwState === 'SHAKING' || throwState === 'CAUGHT'
                 }">
                <div class="w-12 h-12 bg-red-600 rounded-full border-4 border-black relative overflow-hidden"
                     [ngClass]="{
                       'animate-shake': throwState === 'SHAKING',
                       'bg-gray-400': throwState === 'CAUGHT'
                     }">
                     <div class="absolute top-1/2 w-full h-1 bg-black"></div>
                     <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-black z-10"></div>
                     <div class="absolute bottom-0 w-full h-1/2 bg-white"></div>
                </div>
            </div>
        </div>

        <!-- PLAYER HUD -->
        <div class="absolute bottom-[35%] right-10 bg-[#f8f8f8] border-4 border-yellow-600 rounded-lg p-4 shadow-lg w-80 z-10 triangle-box">
             <div class="flex justify-between items-baseline mb-1">
               <span class="font-bold text-xl uppercase text-gray-800">DEV {{ authService.getUserDisplayName() }}</span>
               <span class="text-sm font-bold text-gray-800">Lv.1</span>
             </div>
             <div class="w-full bg-gray-300 h-4 rounded-full border-2 border-gray-500 overflow-hidden relative">
               <div class="h-full bg-green-500 w-full"></div>
                <div class="absolute top-0 right-14 text-xs font-bold text-black">100/100</div>
             </div>
             <!-- EXP BAR -->
             <div class="w-full bg-gray-400 h-2 mt-1 rounded-full border border-gray-600 overflow-hidden">
                <div class="h-full bg-blue-400 w-[10%]"></div>
             </div>
        </div>

        <!-- TEXT BOX / ACTION MENU -->
        <div class="h-[40%] bg-gray-800 border-t-8 border-double border-gray-600 p-6 flex">
           
           <!-- DIALOGUE BOX -->
           <div class="flex-1 bg-white border-4 border-gray-400 rounded p-6 font-bold text-xl md:text-3xl text-gray-800 leading-relaxed shadow-inner" style="font-family: 'Courier New', monospace;">
              <p *ngIf="battleMessage">{{ battleMessage }}</p>

              <!-- Result Success -->
              <div *ngIf="stage === 'CAUGHT'" class="mt-4 text-center">
                  <p class="text-green-600 mb-4">Fonctionnalité PLAYGROUND débloquée !</p>
                  <button (click)="close()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-lg animate-pulse">
                      CONTINUER
                  </button>
              </div>
           </div>

           <!-- ACTION MENU (Only visible when idle) -->
           <div *ngIf="!isBusy && stage === 'BATTLE'" class="w-1/3 ml-4 bg-white border-4 border-blue-800 rounded grid grid-cols-2 gap-2 p-2">
              <button disabled class="bg-gray-200 text-gray-400 font-bold border-2 border-gray-300 rounded hover:bg-red-100 text-left pl-4">
                 ATTAQUE
              </button>
              <button (click)="useBag()" class="bg-white text-gray-800 font-bold border-2 border-gray-300 rounded hover:bg-yellow-100 hover:border-yellow-400 text-left pl-4 uppercase">
                 SAC
              </button>
              <button disabled class="bg-gray-200 text-gray-400 font-bold border-2 border-gray-300 rounded hover:bg-green-100 text-left pl-4">
                 POKEMON
              </button>
              <button (click)="runAway()" class="bg-white text-gray-800 font-bold border-2 border-gray-300 rounded hover:bg-blue-100 hover:border-blue-400 text-left pl-4 uppercase">
                 FUITE
              </button>
           </div>

           <!-- BAG MENU -->
           <div *ngIf="showBag" class="w-1/3 ml-4 bg-white border-4 border-yellow-600 rounded p-2 flex flex-col gap-2">
               <button (click)="throwBall()" class="bg-red-100 hover:bg-red-200 border-2 border-red-300 text-red-800 font-bold py-2 px-4 rounded flex items-center">
                   <span class="w-4 h-4 rounded-full bg-red-500 border border-black mr-2"></span>
                   MASTER BALL (x1)
               </button>
               <button (click)="showBag = false" class="mt-auto text-sm text-gray-500 underline text-center">
                   Retour
               </button>
           </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    /* GLITCH EFFECT */
    .glitch-text {
      text-shadow: 2px 2px 0px #ff0000, -2px -2px 0px #00ff00;
      animation: glitch 0.5s infinite;
    }
    @keyframes glitch {
      0% { transform: translate(0) }
      20% { transform: translate(-2px, 2px) }
      40% { transform: translate(-2px, -2px) }
      60% { transform: translate(2px, 2px) }
      80% { transform: translate(2px, -2px) }
      100% { transform: translate(0) }
    }

    /* BATTLE TRANSITION */
    .battle-transition {
        width: 100%;
        height: 100%;
        background: 
            linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),
            linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000);
        background-size: 60px 60px;
        background-position: 0 0, 30px 30px;
        animation: flash 2.5s ease-in-out;
    }
    @keyframes flash {
        0%, 20%, 40% { opacity: 1; background-color: black; }
        10%, 30% { opacity: 0; background-color: white; }
        50% { opacity: 1; transform: scale(1); }
        100% { opacity: 1; transform: scale(30); background-color: white; }
    }

    /* POKEMON BOUNCE */
    .animate-bounce-custom {
        animation: bounce 2s infinite ease-in-out;
    }
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }

    /* POKEBALL THROW */
    .animate-throw {
        animation: throwBall 3s forwards cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    @keyframes throwBall {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(50vw, -25vh) scale(0.7); }
        100% { transform: translate(75vw, -30vh) scale(0.8); } /* Centered on Playground */
    }

    /* FINAL POSITION HOLDER */
    .caught-position {
        transform: translate(75vw, -30vh) scale(0.8);
    }

    /* SHAKE */
    .animate-shake {
        animation: shake 2s 3 ease-in-out forwards;
    }
    @keyframes shake {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-15deg); }
        75% { transform: rotate(15deg); }
    }

    .triangle-box:after {
        content: '';
        position: absolute;
        bottom: 0;
        right: -20px;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 20px 0 0 20px;
        border-color: transparent transparent transparent #d97706; /* yellow-600 */
    }
  `]
})
export class EasterEggModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  stage: Stage = 'HIDDEN';
  throwState: 'NONE' | 'THROWING' | 'SHAKING' | 'CAUGHT' = 'NONE';

  battleMessage = "Un module PLAYGROUND sauvage apparaît !";
  isBusy = false;
  showBag = false;

  private audio = new Audio('assets/sons/asset_easter_egg.mp3');
  private audioCaptured = new Audio('assets/sons/easter_egg_captured.mp3');

  constructor(public authService: AuthService) {
    this.audio.volume = 0.4; // Reasonable volume
    this.audioCaptured.volume = 0.4;
  }

  open() {
    this.stage = 'PROFESSOR';
  }

  startBattle() {
    // Play audio
    this.audio.currentTime = 0;
    this.audio.play().catch(e => console.error("Audio play failed", e));

    this.stage = 'TRANSITION';
    // Play transition for 2.5s then start battle
    setTimeout(() => {
      this.stage = 'BATTLE';
      this.throwState = 'NONE';
      this.battleMessage = "Un module PLAYGROUND sauvage apparaît !";
      this.isBusy = false;
    }, 2500);
  }

  close() {
    // Stop audio
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audioCaptured.pause();
    this.audioCaptured.currentTime = 0;

    this.stage = 'HIDDEN';
    this.closed.emit();
  }

  useBag() {
    this.battleMessage = "Choisissez un objet...";
    this.showBag = true;
  }

  runAway() {
    this.battleMessage = "Impossible de fuir ! C'est votre destin !";
    this.isBusy = true;
    setTimeout(() => {
      this.battleMessage = "Que doit faire DEV ?";
      this.isBusy = false;
    }, 2000);
  }

  throwBall() {
    this.showBag = false;
    this.isBusy = true;
    this.battleMessage = "DEV utilise MASTER BALL !";

    setTimeout(() => {
      // Animation
      this.throwState = 'THROWING';

      // Change audio immediately when throwing
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audioCaptured.currentTime = 0;
      this.audioCaptured.play().catch(e => console.error("Audio capture play failed", e));

      // Wait for throw to land
      setTimeout(() => {
        this.throwState = 'SHAKING';
        this.battleMessage = "...";

        // Wait for shakes (3 * 1.5s = 4.5s)
        setTimeout(async () => {
          this.throwState = 'CAUGHT';
          this.battleMessage = "Et hop ! PLAYGROUND a été capturé !";
          this.stage = 'CAUGHT';

          // Unlock permission in backend
          await this.authService.unlockPlayground();
        }, 7500); // 5 shakes * 1.5s

      }, 2000);
    }, 1000);
  }
}
