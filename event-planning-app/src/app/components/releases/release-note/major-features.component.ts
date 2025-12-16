import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Squad, Feature } from '@models/release.model';
import { PermissionService } from '@services/permission.service';

@Component({
  selector: 'app-major-features',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card overflow-hidden">
      <div
        class="p-4 border-b bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 dark:to-transparent flex justify-between items-center cursor-pointer hover:from-green-100 dark:hover:from-green-900/30 transition-all duration-200"
        (click)="toggleExpanded()"
      >
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
            <span class="material-icons text-xl text-green-600 dark:text-green-400">star</span>
          </div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Fonctionnalités Majeures</h2>
        </div>
        <span class="material-icons text-gray-500">
          {{ isExpanded ? 'expand_less' : 'expand_more' }}
        </span>
      </div>

      <div *ngIf="isExpanded" class="p-6 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900/30">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let squad of squads"
            class="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-300"
          >
            <!-- Gradient top border -->
            <div class="h-1 bg-gradient-to-r from-green-400 to-green-600"></div>

            <div class="p-4 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span class="text-white font-bold text-sm">{{ squad.squadNumber }}</span>
                  </div>
                  <h3 class="text-base font-bold text-gray-900 dark:text-white">Squad {{ squad.squadNumber }}</h3>
                </div>
                <button
                  *ngIf="hasWriteAccess()"
                  (click)="onAddFeature(squad)"
                  class="flex items-center space-x-1 px-2 py-1 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  <span class="material-icons text-sm">add</span>
                  <span>Ajouter</span>
                </button>
              </div>

              <!-- Add/Edit Feature Form -->
              <div
                *ngIf="editingSquadId === squad.id"
                class="p-4 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/20 dark:to-transparent border border-primary-200 dark:border-primary-800 rounded-lg"
              >
                <h4 class="font-medium text-gray-900 dark:text-white mb-3 text-sm">
                  {{ editingFeatureId ? "Modifier la fonctionnalité" : "Nouvelle fonctionnalité" }}
                </h4>
                <div class="space-y-3">
                  <input
                    type="text"
                    [(ngModel)]="featureForm.title"
                    placeholder="Titre de la fonctionnalité"
                    class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <textarea
                    [(ngModel)]="featureForm.description"
                    placeholder="Description (optionnel)"
                    rows="2"
                    class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  ></textarea>
                  <div class="flex space-x-2 pt-1">
                    <button
                      *ngIf="hasWriteAccess()"
                      (click)="onSaveFeature(squad.id!)"
                      class="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                      Enregistrer
                    </button>
                    <button
                      (click)="onCancelEdit()"
                      class="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>

              <!-- Features List -->
              <div>
                <div *ngIf="squad.features && squad.features.length > 0" class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  <div
                    *ngFor="let feature of squad.features"
                    class="group relative bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 dark:to-transparent border-l-4 border-green-500 p-3 rounded-r-lg hover:shadow-md transition-all duration-200"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex items-start space-x-3 flex-1">
                        <div class="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                          <span class="material-icons text-sm text-green-600 dark:text-green-400">star</span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <h4 class="font-semibold text-gray-900 dark:text-white leading-snug text-sm">{{ feature.title }}</h4>
                          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed" *ngIf="feature.description">{{ feature.description }}</p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                        <button
                          *ngIf="hasWriteAccess()"
                          (click)="onEditFeature(squad, feature)"
                          class="p-1.5 text-primary-600 hover:text-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                          <span class="material-icons text-base">edit</span>
                        </button>
                        <button
                          *ngIf="hasWriteAccess()"
                          (click)="onDeleteFeature(squad.id!, feature.id!)"
                          class="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <span class="material-icons text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  *ngIf="!squad.features || squad.features.length === 0"
                  class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/30"
                >
                  <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                    <span class="material-icons text-2xl text-green-400 dark:text-green-500">playlist_add_check</span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Aucune fonctionnalité majeure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
  `]
})
export class MajorFeaturesComponent {
  @Input() squads: Squad[] = [];
  @Input() isExpanded = false;

  @Output() isExpandedChange = new EventEmitter<boolean>();
  @Output() saveFeature = new EventEmitter<{ squadId: string; feature: Partial<Feature> }>();
  @Output() deleteFeature = new EventEmitter<{ squadId: string; featureId: string }>();

  editingSquadId: string | null = null;
  editingFeatureId: string | null = null;
  featureForm: Partial<Feature> = {
    title: '',
    description: ''
  };

  constructor(private permissionService: PermissionService) {}

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
    this.isExpandedChange.emit(this.isExpanded);
  }

  hasWriteAccess(): boolean {
    return this.permissionService.hasWriteAccess('RELEASES');
  }

  onAddFeature(squad: Squad): void {
    this.editingSquadId = squad.id!;
    this.editingFeatureId = null;
    this.featureForm = {
      title: '',
      description: ''
    };
  }

  onEditFeature(squad: Squad, feature: Feature): void {
    this.editingSquadId = squad.id!;
    this.editingFeatureId = feature.id!;
    this.featureForm = {
      title: feature.title,
      description: feature.description
    };
  }

  onSaveFeature(squadId: string): void {
    if (!this.featureForm.title?.trim()) {
      return;
    }

    this.saveFeature.emit({
      squadId,
      feature: {
        id: this.editingFeatureId || undefined,
        title: this.featureForm.title.trim(),
        description: this.featureForm.description?.trim() || ''
      }
    });

    this.onCancelEdit();
  }

  onCancelEdit(): void {
    this.editingSquadId = null;
    this.editingFeatureId = null;
    this.featureForm = {
      title: '',
      description: ''
    };
  }

  onDeleteFeature(squadId: string, featureId: string): void {
    this.deleteFeature.emit({ squadId, featureId });
  }
}
