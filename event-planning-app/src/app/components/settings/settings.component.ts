import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '@services/settings.service';
import { CategoryService } from '@services/category.service';
import { Theme, UserPreferences } from '@models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center space-x-3">
        <span class="material-icons text-3xl text-primary-600 dark:text-primary-400">settings</span>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
      </div>

      <!-- Theme -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Apparence
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thème
            </label>
            <div class="flex space-x-4">
              <button
                (click)="setTheme('light')"
                [class.ring-2]="preferences.theme === 'light'"
                [class.ring-primary-500]="preferences.theme === 'light'"
                class="flex items-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
              >
                <span class="material-icons text-gray-700 dark:text-gray-300">light_mode</span>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Clair</span>
              </button>

              <button
                (click)="setTheme('dark')"
                [class.ring-2]="preferences.theme === 'dark'"
                [class.ring-primary-500]="preferences.theme === 'dark'"
                class="flex items-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
              >
                <span class="material-icons text-gray-700 dark:text-gray-300">dark_mode</span>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Sombre</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
          <span>Catégories</span>
          <button
            (click)="showAddCategoryForm = !showAddCategoryForm"
            class="btn btn-primary btn-sm flex items-center space-x-1"
          >
            <span class="material-icons text-sm">add</span>
            <span>Ajouter une catégorie personnalisée</span>
          </button>
        </h2>

        <!-- Default Categories Display -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Catégories par défaut</h3>
          <div class="flex flex-wrap gap-2">
            <div
              *ngFor="let category of getDefaultCategories()"
              class="inline-flex items-center space-x-2 px-3 py-2 border-2 rounded-lg"
              [style.border-color]="category.color"
              [style.background-color]="category.color + '15'"
            >
              <span
                class="material-icons text-sm"
                [style.color]="category.color"
              >
                {{ category.icon }}
              </span>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ category.label }}
              </span>
            </div>
          </div>
        </div>

        <!-- Add Category Form -->
        <div *ngIf="showAddCategoryForm" class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de la catégorie
              </label>
              <input
                type="text"
                [(ngModel)]="newCategoryLabel"
                placeholder="Ex: Réunion client"
                class="input text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Couleur
              </label>
              <div class="grid grid-cols-6 gap-2">
                <button
                  *ngFor="let color of predefinedColors"
                  type="button"
                  (click)="newCategoryColor = color.hex"
                  [class.ring-2]="newCategoryColor === color.hex"
                  [class.ring-offset-2]="newCategoryColor === color.hex"
                  [class.ring-gray-900]="newCategoryColor === color.hex"
                  [class.dark:ring-white]="newCategoryColor === color.hex"
                  [style.background-color]="color.hex"
                  class="h-10 w-10 rounded-lg border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                  [title]="color.label"
                >
                </button>
              </div>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Couleur sélectionnée: {{ newCategoryColor }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icône (Material Icons)
              </label>
              <input
                type="text"
                [(ngModel)]="newCategoryIcon"
                placeholder="Ex: meeting_room, work, business"
                class="input text-sm"
              />
              <div class="mt-1 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span class="material-icons" style="font-size: 18px;">{{ newCategoryIcon || 'event' }}</span>
                <span>Aperçu de l'icône</span>
              </div>
            </div>

            <div class="flex space-x-2">
              <button
                (click)="addCustomCategory()"
                [disabled]="!newCategoryLabel || !newCategoryColor"
                class="btn btn-primary btn-sm"
              >
                Enregistrer
              </button>
              <button
                (click)="cancelAddCategory()"
                class="btn btn-secondary btn-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>

        <!-- Custom Categories List -->
        <div *ngIf="preferences.customCategories.length > 0" class="mt-6">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Catégories personnalisées</h3>
          <div class="flex flex-wrap gap-2">
            <div
              *ngFor="let category of preferences.customCategories"
              class="group relative inline-flex items-center space-x-2 px-3 py-2 border-2 rounded-lg"
              [style.border-color]="category.color"
              [style.background-color]="category.color + '15'"
            >
              <span
                class="material-icons text-sm"
                [style.color]="category.color"
              >
                {{ category.icon }}
              </span>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ category.label }}
              </span>
              <button
                (click)="deleteCustomCategory(category.id)"
                class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                title="Supprimer"
              >
                <span class="material-icons" style="font-size: 14px;">close</span>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="preferences.customCategories.length === 0 && !showAddCategoryForm" class="mt-4 text-center py-6 text-gray-500 dark:text-gray-400">
          <span class="material-icons text-4xl mb-2">category</span>
          <p class="text-sm">Aucune catégorie personnalisée</p>
          <p class="text-xs">Cliquez sur "Ajouter" pour créer une catégorie</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions
        </h2>

        <div class="space-y-3">
          <button
            (click)="resetToDefaults()"
            class="btn btn-secondary w-full justify-center"
          >
            Réinitialiser aux valeurs par défaut
          </button>

          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            Cette action restaurera tous les paramètres à leurs valeurs par défaut
          </p>
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
export class SettingsComponent implements OnInit {
  preferences: UserPreferences = {
    theme: 'light',
    customCategories: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  allCategories: any[] = [];

  // Custom category form
  showAddCategoryForm = false;
  newCategoryLabel = '';
  newCategoryColor = '#3b82f6';
  newCategoryIcon = 'event';

  // Couleurs prédéfinies pour les catégories personnalisées
  predefinedColors = [
    { hex: '#22c55e', label: 'Vert' },
    { hex: '#ef4444', label: 'Rouge' },
    { hex: '#6b7280', label: 'Gris' },
    { hex: '#eab308', label: 'Jaune' },
    { hex: '#06b6d4', label: 'Turquoise' },
    { hex: '#f97316', label: 'Orange' },
    { hex: '#1f2937', label: 'Gris foncé' },
    { hex: '#8b5cf6', label: 'Violet' },
    { hex: '#3b82f6', label: 'Bleu' },
    { hex: '#ec4899', label: 'Rose' },
    { hex: '#14b8a6', label: 'Teal' },
    { hex: '#f59e0b', label: 'Ambre' }
  ];

  constructor(
    private settingsService: SettingsService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.settingsService.preferences$.subscribe(prefs => {
      this.preferences = prefs;
    });

    // Charger toutes les catégories (défaut + personnalisées)
    this.categoryService.allCategories$.subscribe(categories => {
      this.allCategories = categories;
    });
  }

  async setTheme(theme: Theme): Promise<void> {
    await this.settingsService.setTheme(theme);
  }

  async resetToDefaults(): Promise<void> {
    const confirmed = confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?');
    if (confirmed) {
      await this.settingsService.resetToDefaults();
    }
  }

  getDefaultCategories(): any[] {
    return this.allCategories.filter(cat => !cat.isCustom);
  }

  // Custom category methods
  async addCustomCategory(): Promise<void> {
    if (!this.newCategoryLabel || !this.newCategoryColor) {
      return;
    }

    try {
      await this.categoryService.addCustomCategory(
        this.newCategoryLabel,
        this.newCategoryColor,
        this.newCategoryIcon || 'event'
      );

      // Reset form
      this.newCategoryLabel = '';
      this.newCategoryColor = '#3b82f6';
      this.newCategoryIcon = 'event';
      this.showAddCategoryForm = false;
    } catch (error) {
      console.error('Error adding custom category:', error);
      alert('Erreur lors de l\'ajout de la catégorie');
    }
  }

  cancelAddCategory(): void {
    this.newCategoryLabel = '';
    this.newCategoryColor = '#3b82f6';
    this.newCategoryIcon = 'event';
    this.showAddCategoryForm = false;
  }

  async deleteCustomCategory(id: string): Promise<void> {
    const confirmed = confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?');
    if (confirmed) {
      try {
        await this.categoryService.deleteCustomCategory(id);
      } catch (error) {
        console.error('Error deleting custom category:', error);
        alert('Erreur lors de la suppression de la catégorie');
      }
    }
  }
}
