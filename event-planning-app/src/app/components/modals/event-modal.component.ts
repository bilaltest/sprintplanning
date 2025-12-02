import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Event, EventCategory, EventColor, EventIcon, EVENT_CATEGORY_LABELS, CATEGORY_DEFAULTS } from '@models/event.model';
import { EventService } from '@services/event.service';
import { CategoryService, CategoryInfo } from '@services/category.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-content fade-in-scale" (click)="$event.stopPropagation()">
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ isEditMode ? "Modifier l'événement" : "Nouvel événement" }}
          </h2>
          <button
            (click)="close.emit()"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span class="material-icons text-gray-500 dark:text-gray-400">close</span>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" class="p-6 space-y-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="formData.title"
              name="title"
              maxlength="30"
              required
              class="input"
              placeholder="Nom de l'événement"
            />
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ formData.title.length }}/30 caractères
            </div>
          </div>

          <!-- Date and time -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date <span class="text-red-500">*</span>
              </label>
              <input
                type="date"
                [(ngModel)]="formData.date"
                name="date"
                required
                class="input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Heure début
              </label>
              <input
                type="time"
                [(ngModel)]="formData.startTime"
                name="startTime"
                class="input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Heure fin
              </label>
              <input
                type="time"
                [(ngModel)]="formData.endTime"
                name="endTime"
                class="input"
              />
            </div>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégorie <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                *ngFor="let cat of allCategories"
                type="button"
                (click)="selectCategory(cat.id)"
                [class.ring-2]="formData.category === cat.id"
                [class.ring-primary-500]="formData.category === cat.id"
                class="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span
                  class="material-icons text-lg"
                  [style.color]="cat.color"
                >
                  {{ cat.icon }}
                </span>
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  {{ cat.label }}
                </span>
              </button>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              [(ngModel)]="formData.description"
              name="description"
              maxlength="500"
              rows="4"
              class="input resize-none"
              placeholder="Description optionnelle..."
            ></textarea>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ (formData.description || '').length }}/500 caractères
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <button
                *ngIf="isEditMode"
                type="button"
                (click)="onDelete()"
                class="btn btn-danger"
              >
                Supprimer
              </button>
            </div>

            <div class="flex items-center space-x-3">
              <button
                type="button"
                (click)="close.emit()"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="!isFormValid()"
                class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isEditMode ? 'Enregistrer' : 'Créer' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EventModalComponent implements OnInit {
  @Input() event?: Event;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Event>();

  isEditMode = false;
  allCategories: CategoryInfo[] = [];

  formData = {
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    category: 'mep' as string,
    color: '#22c55e',
    icon: 'rocket_launch',
    description: ''
  };

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    // Charger les catégories
    this.categoryService.allCategories$.subscribe(categories => {
      this.allCategories = categories;
    });

    if (this.event) {
      this.isEditMode = true;
      this.formData = {
        title: this.event.title,
        date: this.event.date,
        startTime: this.event.startTime || '',
        endTime: this.event.endTime || '',
        category: this.event.category,
        color: this.event.color,
        icon: this.event.icon,
        description: this.event.description || ''
      };
    } else {
      // Set default date to today
      this.formData.date = new Date().toISOString().split('T')[0];
    }
  }

  selectCategory(categoryId: string): void {
    this.formData.category = categoryId;
    const category = this.categoryService.getCategoryById(categoryId);
    if (category) {
      this.formData.color = category.color;
      this.formData.icon = category.icon;
    }
  }

  isFormValid(): boolean {
    return this.formData.title.trim() !== '' && this.formData.date !== '';
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;

    try {
      const eventData = {
        title: this.formData.title.trim(),
        date: this.formData.date,
        startTime: this.formData.startTime || undefined,
        endTime: this.formData.endTime || undefined,
        category: this.formData.category,
        color: this.formData.color,
        icon: this.formData.icon,
        description: this.formData.description.trim() || undefined
      };

      if (this.isEditMode && this.event?.id) {
        await this.eventService.updateEvent(this.event.id, eventData);
        this.toastService.success(
          'Événement modifié',
          `${eventData.title} a été mis à jour avec succès`
        );
      } else {
        await this.eventService.createEvent(eventData);
        this.toastService.success(
          'Événement créé',
          `${eventData.title} a été ajouté au planning`
        );
      }

      this.save.emit();
    } catch (error) {
      console.error('Error saving event:', error);
      this.toastService.error(
        'Erreur de sauvegarde',
        'Impossible de sauvegarder l\'événement. Veuillez réessayer.'
      );
    }
  }

  async onDelete(): Promise<void> {
    if (!this.event?.id) return;

    const confirmed = await this.confirmationService.confirm({
      title: 'Supprimer l\'événement',
      message: `Êtes-vous sûr de vouloir supprimer "${this.event.title}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmButtonClass: 'danger'
    });

    if (!confirmed) return;

    try {
      const eventTitle = this.event.title;
      await this.eventService.deleteEvent(this.event.id);
      this.toastService.success(
        'Événement supprimé',
        `${eventTitle} a été supprimé du planning`
      );
      this.save.emit();
    } catch (error) {
      console.error('Error deleting event:', error);
      this.toastService.error(
        'Erreur de suppression',
        'Impossible de supprimer l\'événement. Veuillez réessayer.'
      );
    }
  }

  onOverlayClick(event: MouseEvent): void {
    this.close.emit();
  }
}
