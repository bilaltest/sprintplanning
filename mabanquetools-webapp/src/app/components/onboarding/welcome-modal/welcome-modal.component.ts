import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-welcome-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="modal-content overflow-hidden relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-auto outline-none">
      
      <!-- Banner / Header with Gradient -->
      <div class="relative h-48 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 opacity-20">
             <svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
             </svg>
        </div>
        <div class="text-center z-10 p-6">
          <div class="mx-auto bg-white/20 backdrop-blur-sm p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 shadow-inner border border-white/30">
            <span class="material-icons text-white text-5xl">rocket_launch</span>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight drop-shadow-md">Bienvenue !</h1>
        </div>
        
        <button (click)="close()" class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-black/10 hover:bg-black/20 rounded-full p-1 backdrop-blur-md">
            <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Body Content -->
      <div class="p-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">Découvrez votre nouvel espace Ma Banque Tools</h2>
        
        <p class="text-gray-600 dark:text-gray-300 text-center mb-8 leading-relaxed">
          Nous sommes ravis de vous accueillir. Voulez-vous une visite guidée rapide pour découvrir les principales fonctionnalités ?
        </p>

        <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button (click)="skip()" 
            class="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium rounded-full transition-colors duration-200">
            Non, je connais déjà
          </button>
          
          <button (click)="startTour()" 
            class="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2">
            <span>Démarrer la visite</span>
            <span class="material-icons">flag</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class WelcomeModalComponent {
  constructor(private dialogRef: MatDialogRef<WelcomeModalComponent>) { }

  startTour(): void {
    this.dialogRef.close(true);
  }

  skip(): void {
    this.dialogRef.close(false);
  }

  close(): void {
    // Default close button acts as skip/dismiss without explicitly disabling everything?
    // Or should it just close? Let's say it just closes. 
    // But for this flow, user must choose. 
    // I will make the top-right close button equivalent to "Skip" for safety, 
    // OR return undefined to let HomeComponent decide (e.g. show again later?).
    // For simplicity: close = skip for now.
    this.dialogRef.close(false);
  }
}
