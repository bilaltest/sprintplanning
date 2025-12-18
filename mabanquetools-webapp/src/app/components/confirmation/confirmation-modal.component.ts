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
      class="modal-overlay"
      [@fadeIn]
      (click)="cancel()"
    >
      <!-- Modal with glassmorphism -->
      <div
        class="modal-content max-w-md fade-in-scale"
        [@slideIn]
        (click)="$event.stopPropagation()"
      >
        <!-- Header with glassmorphism -->
        <div class="modal-header-glass">
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
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex items-center justify-end space-x-3">
          <button
            (click)="cancel()"
            class="btn btn-secondary"
          >
            {{ options.cancelText || 'Annuler' }}
          </button>
          <button
            (click)="confirm()"
            class="btn"
            [ngClass]="{
              'btn-danger': options.confirmButtonClass === 'danger',
              'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500': options.confirmButtonClass === 'warning',
              'btn-primary': options.confirmButtonClass === 'primary' || !options.confirmButtonClass
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
