import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Microservice, CreateMicroserviceRequest, UpdateMicroserviceRequest } from '../../../models/microservice.model';
import { MicroserviceService } from '../../../services/microservice.service';
import { ToastService } from '../../../services/toast.service';

const SQUAD_OPTIONS = ['Squad 1', 'Squad 2', 'Squad 3', 'Squad 4', 'Squad 5', 'Squad 6'];

interface DialogData {
  mode: 'create' | 'edit';
  microservice?: Microservice;
}

@Component({
  selector: 'app-microservice-management-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="modal-overlay">
      <div class="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-xl w-full mx-4">
        <div class="modal-header bg-gradient-releases text-white px-6 py-4 rounded-t-lg">
          <h2 class="text-xl font-semibold">
            {{ data.mode === 'create' ? 'Nouveau microservice' : 'Modifier le microservice' }}
          </h2>
          <button (click)="onCancel()" class="text-white hover:text-gray-200 transition-colors">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-body p-6 space-y-4">
          <!-- Mode création: formulaire simplifié -->
          <div *ngIf="data.mode === 'create'">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Le microservice sera créé et ajouté automatiquement au tableau de release note. Les autres champs (tag, ordre de déploiement, etc.) pourront être renseignés directement dans le tableau.
            </p>
          </div>

          <!-- Nom -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom du microservice <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="name"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="ex: Service Notification"
            />
            <div *ngIf="form.get('name')?.invalid && form.get('name')?.touched"
                 class="text-red-500 text-sm mt-1">
              Le nom du microservice est requis
            </div>
          </div>


          <!-- Solution -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Solution <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="solution"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="ex: s2267-zm038"
            />
            <div *ngIf="form.get('solution')?.invalid && form.get('solution')?.touched"
                 class="text-red-500 text-sm mt-1">
              La solution est requise
            </div>
          </div>
          
          <!-- Squad -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Squad <span class="text-red-500">*</span>
            </label>
            <select
              formControlName="squad"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Sélectionner une squad</option>
              <option *ngFor="let squad of squadOptions" [value]="squad">{{ squad }}</option>
            </select>
            <div *ngIf="form.get('squad')?.invalid && form.get('squad')?.touched"
                 class="text-red-500 text-sm mt-1">
              La squad est requise
            </div>
          </div>

          <!-- Champs additionnels en mode édition uniquement -->
          <div *ngIf="data.mode === 'edit'">
            <!-- Display Order -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ordre d'affichage
              </label>
              <input
                type="number"
                formControlName="displayOrder"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
                min="0"
              />
            </div>

            <!-- Description -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                formControlName="description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Description optionnelle..."
              ></textarea>
            </div>

            <!-- Active Status -->
            <div class="flex items-center">
              <input
                type="checkbox"
                formControlName="isActive"
                id="isActive"
                class="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label for="isActive" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Microservice actif
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700
                     rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              [disabled]="form.invalid || isSubmitting"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg
                     shadow-sm hover:shadow-md transition-all duration-200
                     flex items-center space-x-2
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 disabled:shadow-sm"
            >
              <span class="material-icons text-sm">{{ data.mode === 'create' ? 'add' : 'save' }}</span>
              <span>{{ data.mode === 'create' ? 'Créer et ajouter au tableau' : 'Enregistrer' }}</span>
            </button>
          </div>
        </form>
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

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `]
})
export class MicroserviceManagementModalComponent {
  form: FormGroup;
  squadOptions = SQUAD_OPTIONS;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private microserviceService: MicroserviceService,
    private toastService: ToastService,
    private dialogRef: MatDialogRef<MicroserviceManagementModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    // En mode création, les champs sont vides donc le formulaire sera invalide
    // jusqu'à ce que l'utilisateur remplisse les champs requis
    this.form = this.fb.group({
      name: [data.microservice?.name || '', [Validators.required]],
      squad: [data.microservice?.squad || '', [Validators.required]],
      solution: [data.microservice?.solution || '', [Validators.required]],
      displayOrder: [data.microservice?.displayOrder || 0],
      description: [data.microservice?.description || ''],
      isActive: [data.microservice?.isActive !== undefined ? data.microservice.isActive : true]
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    if (this.data.mode === 'create') {
      const request: CreateMicroserviceRequest = {
        name: this.form.value.name,
        squad: this.form.value.squad,
        solution: this.form.value.solution || undefined,
        displayOrder: this.form.value.displayOrder || 0,
        description: this.form.value.description || undefined
      };

      this.microserviceService.create(request).subscribe({
        next: (microservice) => {
          this.toastService.success('Microservice créé avec succès');
          this.dialogRef.close(microservice);
        },
        error: (error) => {
          console.error('Error creating microservice:', error);
          this.toastService.error(
            error.error?.message || 'Erreur lors de la création du microservice'
          );
          this.isSubmitting = false;
        }
      });
    } else {
      const request: UpdateMicroserviceRequest = {
        name: this.form.value.name,
        squad: this.form.value.squad,
        solution: this.form.value.solution || undefined,
        displayOrder: this.form.value.displayOrder,
        isActive: this.form.value.isActive,
        description: this.form.value.description || undefined
      };

      this.microserviceService.update(this.data.microservice!.id!, request).subscribe({
        next: (microservice) => {
          this.toastService.success('Microservice mis à jour avec succès');
          this.dialogRef.close(microservice);
        },
        error: (error) => {
          console.error('Error updating microservice:', error);
          this.toastService.error(
            error.error?.message || 'Erreur lors de la mise à jour du microservice'
          );
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
