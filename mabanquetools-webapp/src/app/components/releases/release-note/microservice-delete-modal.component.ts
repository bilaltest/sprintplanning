import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MicroserviceService } from '../../../services/microservice.service';
import { ToastService } from '../../../services/toast.service';
import { Microservice } from '../../../models/microservice.model';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-microservice-delete-modal',
    standalone: true,
    imports: [CommonModule, MatDialogModule],
    template: `
    <div class="modal-overlay">
      <div class="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-xl w-full mx-4 overflow-hidden">
        <div class="modal-header bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-4">
          <h2 class="text-xl font-semibold flex items-center">
            <span class="material-icons mr-2">delete_sweep</span>
            Supprimer des microservices
          </h2>
          <button (click)="onCancel()" class="text-white hover:text-gray-200 transition-colors">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="modal-body p-6">
          <div *ngIf="isLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>

          <div *ngIf="!isLoading && microservices.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun microservice actif à supprimer.
          </div>

          <div *ngIf="!isLoading && microservices.length > 0">
            <p class="mb-4 text-gray-600 dark:text-gray-300">
              Sélectionnez les microservices à supprimer (désactiver). Cette action est réversible via la base de données.
            </p>

            <div class="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <div *ngFor="let ms of microservices" 
                   class="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors">
                <input 
                  type="checkbox" 
                  [id]="'ms-' + ms.id" 
                  [checked]="isSelected(ms.id!)"
                  (change)="toggleSelection(ms.id!)"
                  class="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                >
                <label [for]="'ms-' + ms.id" class="ml-3 flex-1 cursor-pointer">
                  <span class="block font-medium text-gray-900 dark:text-white">{{ ms.name }}</span>
                  <span class="block text-xs text-gray-500">{{ ms.squad }} - {{ ms.solution }}</span>
                </label>
              </div>
            </div>

            <div class="mt-2 text-right text-sm text-gray-500">
              {{ selectedIds.size }} microservice(s) sélectionné(s)
            </div>
          </div>
        </div>

        <div class="modal-footer px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            (click)="onDelete()"
            [disabled]="selectedIds.size === 0 || isSubmitting"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span *ngIf="isSubmitting" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            <span class="material-icons text-sm" *ngIf="!isSubmitting">delete</span>
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
  `]
})
export class MicroserviceDeleteModalComponent implements OnInit {
    microservices: Microservice[] = [];
    selectedIds: Set<string> = new Set();
    isLoading = true;
    isSubmitting = false;

    constructor(
        private microserviceService: MicroserviceService,
        private toastService: ToastService,
        private dialogRef: MatDialogRef<MicroserviceDeleteModalComponent>
    ) { }

    ngOnInit(): void {
        this.loadMicroservices();
    }

    loadMicroservices(): void {
        this.isLoading = true;
        this.microserviceService.getAllActive().subscribe({
            next: (data) => {
                this.microservices = data.sort((a, b) => a.name.localeCompare(b.name));
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading microservices', err);
                this.toastService.error('Erreur lors du chargement des microservices');
                this.isLoading = false;
            }
        });
    }

    isSelected(id: string): boolean {
        return this.selectedIds.has(id);
    }

    toggleSelection(id: string): void {
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
        } else {
            this.selectedIds.add(id);
        }
    }

    onDelete(): void {
        if (this.selectedIds.size === 0) return;

        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedIds.size} microservice(s) ?`)) {
            return;
        }

        this.isSubmitting = true;
        const deleteObservables = Array.from(this.selectedIds).map(id =>
            this.microserviceService.delete(id)
        );

        forkJoin(deleteObservables).subscribe({
            next: () => {
                this.toastService.success(`${this.selectedIds.size} microservice(s) supprimé(s) avec succès`);
                this.dialogRef.close(true);
            },
            error: (err) => {
                console.error('Error deleting microservices', err);
                this.toastService.error('Une erreur est survenue lors de la suppression');
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }
}
