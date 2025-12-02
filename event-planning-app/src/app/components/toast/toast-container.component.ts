import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService } from '@services/toast.service';
import { Toast } from '@models/toast.model';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] space-y-3 max-w-md">
      <div
        *ngFor="let toast of toasts$ | async"
        [@slideIn]
        class="min-w-[320px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-l-4 p-4 flex items-start space-x-3 backdrop-blur-sm"
        [ngClass]="{
          'border-green-500 bg-green-50/90 dark:bg-green-900/30': toast.type === 'success',
          'border-red-500 bg-red-50/90 dark:bg-red-900/30': toast.type === 'error',
          'border-orange-500 bg-orange-50/90 dark:bg-orange-900/30': toast.type === 'warning',
          'border-blue-500 bg-blue-50/90 dark:bg-blue-900/30': toast.type === 'info'
        }"
      >
        <!-- Icon -->
        <span
          class="material-icons text-xl flex-shrink-0"
          [ngClass]="{
            'text-green-600 dark:text-green-400': toast.type === 'success',
            'text-red-600 dark:text-red-400': toast.type === 'error',
            'text-orange-600 dark:text-orange-400': toast.type === 'warning',
            'text-blue-600 dark:text-blue-400': toast.type === 'info'
          }"
        >
          {{ getIcon(toast.type) }}
        </span>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h4
            class="font-semibold text-sm leading-tight"
            [ngClass]="{
              'text-green-900 dark:text-green-100': toast.type === 'success',
              'text-red-900 dark:text-red-100': toast.type === 'error',
              'text-orange-900 dark:text-orange-100': toast.type === 'warning',
              'text-blue-900 dark:text-blue-100': toast.type === 'info'
            }"
          >
            {{ toast.title }}
          </h4>
          <p
            *ngIf="toast.message"
            class="text-xs mt-1 leading-relaxed"
            [ngClass]="{
              'text-green-800 dark:text-green-200': toast.type === 'success',
              'text-red-800 dark:text-red-200': toast.type === 'error',
              'text-orange-800 dark:text-orange-200': toast.type === 'warning',
              'text-blue-800 dark:text-blue-200': toast.type === 'info'
            }"
          >
            {{ toast.message }}
          </p>

          <!-- Action Button -->
          <button
            *ngIf="toast.action"
            (click)="handleAction(toast)"
            class="mt-2 text-xs font-medium underline hover:no-underline transition-all"
            [ngClass]="{
              'text-green-700 dark:text-green-300': toast.type === 'success',
              'text-red-700 dark:text-red-300': toast.type === 'error',
              'text-orange-700 dark:text-orange-300': toast.type === 'warning',
              'text-blue-700 dark:text-blue-300': toast.type === 'info'
            }"
          >
            {{ toast.action.label }}
          </button>
        </div>

        <!-- Close Button -->
        <button
          (click)="close(toast.id)"
          class="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <span
            class="material-icons text-sm"
            [ngClass]="{
              'text-green-700 dark:text-green-300': toast.type === 'success',
              'text-red-700 dark:text-red-300': toast.type === 'error',
              'text-orange-700 dark:text-orange-300': toast.type === 'warning',
              'text-blue-700 dark:text-blue-300': toast.type === 'info'
            }"
          >
            close
          </span>
        </button>
      </div>
    </div>
  `,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({
          transform: 'translateX(400px)',
          opacity: 0,
          scale: 0.9
        }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            transform: 'translateX(0)',
            opacity: 1,
            scale: 1
          })
        )
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 1, 1)',
          style({
            transform: 'translateX(400px)',
            opacity: 0,
            scale: 0.9
          })
        )
      ])
    ])
  ],
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ToastContainerComponent {
  toasts$ = this.toastService.toasts$;

  constructor(private toastService: ToastService) {}

  getIcon(type: string): string {
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type as keyof typeof icons] || 'info';
  }

  close(id: string): void {
    this.toastService.dismiss(id);
  }

  handleAction(toast: Toast): void {
    if (toast.action) {
      toast.action.handler();
      this.close(toast.id);
    }
  }
}
