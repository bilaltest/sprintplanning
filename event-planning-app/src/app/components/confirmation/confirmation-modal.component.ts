import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ConfirmationService } from '@services/confirmation.service';
import { ConfirmationOptions } from '@models/confirmation.model';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="confirmation$ | async as options"
      class="fixed inset-0 z-[10000] flex items-center justify-center"
      [@fadeIn]
    >
      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        (click)="cancel()"
      ></div>

      <!-- Modal -->
      <div
        class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4 overflow-hidden"
        [@slideIn]
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <!-- Icon based on type -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              [ngClass]="{
                'bg-red-100 dark:bg-red-900/30': options.confirmButtonClass === 'danger',
                'bg-orange-100 dark:bg-orange-900/30': options.confirmButtonClass === 'warning',
                'bg-blue-100 dark:bg-blue-900/30': options.confirmButtonClass === 'primary' || !options.confirmButtonClass
              }"
            >
              <span
                class="material-icons text-xl"
                [ngClass]="{
                  'text-red-600 dark:text-red-400': options.confirmButtonClass === 'danger',
                  'text-orange-600 dark:text-orange-400': options.confirmButtonClass === 'warning',
                  'text-blue-600 dark:text-blue-400': options.confirmButtonClass === 'primary' || !options.confirmButtonClass
                }"
              >
                {{ getIcon(options.confirmButtonClass) }}
              </span>
            </div>

            <!-- Title -->
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ options.title }}
            </h3>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ options.message }}
          </p>
        </div>

        <!-- Actions -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-end space-x-3">
          <button
            (click)="cancel()"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {{ options.cancelText || 'Annuler' }}
          </button>
          <button
            (click)="confirm()"
            class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            [ngClass]="{
              'bg-red-600 hover:bg-red-700': options.confirmButtonClass === 'danger',
              'bg-orange-600 hover:bg-orange-700': options.confirmButtonClass === 'warning',
              'bg-blue-600 hover:bg-blue-700': options.confirmButtonClass === 'primary' || !options.confirmButtonClass
            }"
          >
            {{ options.confirmText || 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'scale(0.9)', opacity: 0 }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms cubic-bezier(0.4, 0, 1, 1)', style({ transform: 'scale(0.9)', opacity: 0 }))
      ])
    ])
  ],
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ConfirmationModalComponent {
  confirmation$ = this.confirmationService.confirmation$;

  constructor(private confirmationService: ConfirmationService) {}

  getIcon(type?: string): string {
    switch (type) {
      case 'danger':
        return 'warning';
      case 'warning':
        return 'error_outline';
      case 'primary':
      default:
        return 'help_outline';
    }
  }

  confirm(): void {
    this.confirmationService.respond(true);
  }

  cancel(): void {
    this.confirmationService.respond(false);
  }
}
