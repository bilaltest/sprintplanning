import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface TipData {
    title: string;
    content: string;
    icon: string;
    colorClass?: string; // e.g., 'text-emerald-600'
    gradientClass?: string; // e.g., 'from-emerald-500 to-teal-600'
}

@Component({
    selector: 'app-tip-modal',
    standalone: true,
    imports: [CommonModule, MatDialogModule],
    template: `
    <div class="modal-content overflow-hidden relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-auto outline-none border border-gray-100 dark:border-gray-700">
      
      <!-- Header -->
      <div class="relative h-32 flex items-center justify-center overflow-hidden bg-gradient-to-r"
           [ngClass]="data.gradientClass || 'from-emerald-500 to-teal-600'">
        <div class="absolute inset-0 opacity-20">
             <svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 100 C 50 0 50 100 100 0 V 100 Z" fill="white" />
             </svg>
        </div>
        <div class="z-10 bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-inner border border-white/30">
           <span class="material-icons text-white text-5xl">{{ data.icon }}</span>
        </div>
        
        <button (click)="close()" class="absolute top-3 right-3 text-white/70 hover:text-white transition-colors bg-black/10 hover:bg-black/20 rounded-full p-1 backdrop-blur-md">
            <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 text-center">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-3">{{ data.title }}</h2>
        
        <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
          {{ data.content }}
        </p>

        <button (click)="close()" 
          class="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:opacity-90 transition-opacity shadow-lg">
          J'ai compris
        </button>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class TipModalComponent {
    constructor(
        private dialogRef: MatDialogRef<TipModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TipData
    ) { }

    close(): void {
        this.dialogRef.close();
    }
}
