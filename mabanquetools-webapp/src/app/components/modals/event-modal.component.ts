import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Event, EventCategory, EventColor, EventIcon, EVENT_CATEGORY_LABELS, CATEGORY_DEFAULTS } from '@models/event.model';
import { EventService } from '@services/event.service';
import { CategoryService, CategoryInfo } from '@services/category.service';
import { TagService, TagInfo } from '@services/tag.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
import { CanAccessDirective } from '@directives/can-access.directive';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CanAccessDirective],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-content-planning fade-in-scale" (click)="$event.stopPropagation()">
        <div class="modal-header-glass">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-planning-100 dark:bg-planning-900/30 flex items-center justify-center">
              <span class="material-icons text-planning-600 dark:text-planning-400">
                {{ isEditMode ? 'edit_calendar' : 'add_circle' }}
              </span>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ isEditMode ? "Modifier l'événement" : "Nouvel événement" }}
            </h2>
          </div>
          <button
            (click)="close.emit()"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span class="material-icons text-gray-600 dark:text-gray-400">close</span>
          </button>
        </div>



        <div *ngIf="isSprintEvent" class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mx-6 mt-6">
            <div class="flex items-start">
                <span class="material-icons text-blue-500 mr-2">info</span>
                <p class="text-sm text-blue-700 dark:text-blue-300">
                    Cet événement est lié à un sprint. Modifications et suppression doivent se faire via l'administration des sprints.
                </p>
            </div>
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

          <!-- Date -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de début <span class="text-red-500">*</span>
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
                Date de fin (optionnel)
              </label>
              <input
                type="date"
                [(ngModel)]="formData.endDate"
                name="endDate"
                [min]="formData.date"
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
              rows="2"
              class="input resize-none"
              placeholder="Description optionnelle..."
            ></textarea>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ (formData.description || '').length }}/500 caractères
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                *ngFor="let tag of allTags"
                type="button"
                (click)="toggleTag(tag.id)"
                [class.ring-2]="formData.tags.includes(tag.id)"
                [class.ring-offset-1]="formData.tags.includes(tag.id)"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all"
                [style.background-color]="tag.color + '20'"
                [style.color]="tag.color"
                [style.border-color]="tag.color"
              >
                {{ tag.label }}
                <span *ngIf="formData.tags.includes(tag.id)" class="ml-1 material-icons text-[14px]">check</span>
              </button>
              <div *ngIf="allTags.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">
                Aucun tag disponible. Ajoutez-en dans les paramètres.
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
            <div>
              <button
                *ngIf="isEditMode && !isSprintEvent"
                type="button"
                appCanAccess="CALENDAR"
                accessLevel="write"
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
                appCanAccess="CALENDAR"
                accessLevel="write"
                [disabled]="!isFormValid() || isSprintEvent"
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
  allTags: TagInfo[] = [];

  get isSprintEvent(): boolean {
    return !!this.event?.sprintId;
  }

  formData = {
    title: '',
    date: '',
    endDate: '',
    category: 'mep' as string,
    color: '#22c55e',
    icon: 'rocket_launch',
    description: '',
    tags: [] as string[]
  };

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private tagService: TagService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    // Charger les catégories
    this.categoryService.allCategories$.subscribe(categories => {
      this.allCategories = categories;
    });

    // Charger les tags
    this.tagService.allTags$.subscribe(tags => {
      this.allTags = tags;
    });

    if (this.event) {
      this.isEditMode = true;
      this.formData = {
        title: this.event.title,
        date: this.event.date,
        endDate: this.event.endDate || '',
        category: this.event.category,
        color: this.event.color,
        icon: this.event.icon,
        description: this.event.description || '',
        tags: this.event.tags ? [...this.event.tags] : []
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

  toggleTag(tagId: string): void {
    const index = this.formData.tags.indexOf(tagId);
    if (index > -1) {
      this.formData.tags.splice(index, 1);
    } else {
      this.formData.tags.push(tagId);
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
        endDate: this.formData.endDate || undefined,
        category: this.formData.category,
        color: this.formData.color,
        icon: this.formData.icon,
        description: this.formData.description.trim() || undefined,
        tags: this.formData.tags
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
