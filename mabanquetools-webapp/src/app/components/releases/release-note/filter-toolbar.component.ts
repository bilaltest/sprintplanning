import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SQUAD_OPTIONS } from '@models/release-note.model';
import { PermissionService } from '@services/permission.service';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  alwaysVisible?: boolean;
}

@Component({
  selector: 'app-filter-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host {
      display: block;
    }
  `],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- Filter by squad -->
        <div class="flex items-center space-x-2">
          <span class="material-icons text-gray-500 dark:text-gray-400">filter_list</span>
          <select
            [value]="selectedSquad"
            (change)="onSquadChange($event)"
            class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option value="">Toutes les squads</option>
            <option *ngFor="let squad of squadOptions" [value]="squad">{{ squad }}</option>
          </select>
        </div>

        <!-- Filter by Part En MEP -->
        <div class="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <input
            type="checkbox"
            id="showOnlyPartEnMep"
            [checked]="showOnlyPartEnMep"
            (change)="onPartEnMepChange($event)"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label for="showOnlyPartEnMep" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
            Concernés par la MEP
          </label>
        </div>

        <!-- Search -->
        <div class="relative">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            [value]="searchQuery"
            (input)="onSearchChange($event)"
            placeholder="Rechercher un microservice..."
            class="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all w-80"
          />
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <!-- Column selector -->
        <div class="relative">
          <button
            (click)="toggleColumnSelector()"
            class="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 border border-gray-300 dark:border-gray-600"
            title="Colonnes visibles"
          >
            <span class="material-icons text-sm">view_column</span>
            <span class="text-sm font-medium">{{ getVisibleColumnsCount() }}/{{ columns.length }}</span>
            <span class="material-icons text-base">{{ isColumnSelectorOpen ? 'expand_less' : 'expand_more' }}</span>
          </button>

          <!-- Column selector dropdown -->
          <div
            *ngIf="isColumnSelectorOpen"
            class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 class="font-semibold text-gray-900 dark:text-white text-sm">Colonnes visibles</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Sélectionnez les colonnes à afficher</p>
            </div>
            <div class="max-h-96 overflow-y-auto">
              <label
                *ngFor="let column of columns"
                class="flex items-center px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                [class.opacity-50]="column.alwaysVisible"
                [class.cursor-not-allowed]="column.alwaysVisible"
              >
                <input
                  type="checkbox"
                  [checked]="column.visible"
                  [disabled]="column.alwaysVisible"
                  (change)="onColumnToggle(column)"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:cursor-not-allowed"
                />
                <span class="ml-3 text-sm text-gray-900 dark:text-white">
                  {{ column.label }}
                  <span *ngIf="column.alwaysVisible" class="text-xs text-gray-400 ml-1">(toujours visible)</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Add microservice button -->
        <button
          *ngIf="hasWriteAccess()"
          (click)="onAddMicroservice()"
          class="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span class="material-icons text-sm">add</span>
          <span class="font-medium">Ajouter un microservice</span>
        </button>
      </div>
    </div>
  `
})
export class FilterToolbarComponent {
  @Input() selectedSquad = '';
  @Input() showOnlyPartEnMep = false;
  @Input() searchQuery = '';
  @Input() columns: ColumnConfig[] = [];

  @Output() squadChange = new EventEmitter<string>();
  @Output() partEnMepChange = new EventEmitter<boolean>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() columnToggle = new EventEmitter<ColumnConfig>();
  @Output() addMicroservice = new EventEmitter<void>();

  squadOptions = SQUAD_OPTIONS;
  isColumnSelectorOpen = false;

  constructor(private permissionService: PermissionService) {}

  hasWriteAccess(): boolean {
    return this.permissionService.hasWriteAccess('RELEASES');
  }

  onSquadChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.squadChange.emit(value);
  }

  onPartEnMepChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.partEnMepChange.emit(checked);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  toggleColumnSelector(): void {
    this.isColumnSelectorOpen = !this.isColumnSelectorOpen;
  }

  onColumnToggle(column: ColumnConfig): void {
    if (!column.alwaysVisible) {
      this.columnToggle.emit(column);
    }
  }

  getVisibleColumnsCount(): number {
    return this.columns.filter(c => c.visible).length;
  }

  onAddMicroservice(): void {
    this.addMicroservice.emit();
  }
}
