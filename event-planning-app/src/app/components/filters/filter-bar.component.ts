import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterService } from '@services/filter.service';
import { CategoryService, CategoryInfo } from '@services/category.service';
import { EventCategory, EVENT_CATEGORY_LABELS, CATEGORY_DEFAULTS } from '@models/event.model';
import { EventFilter } from '@models/filter.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sticky top-6 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
          <span class="material-icons text-lg">filter_alt</span>
          <span>Filtres</span>
        </h3>

        <button
          *ngIf="hasActiveFilters"
          (click)="resetFilters()"
          class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          Réinitialiser
        </button>
      </div>

      <div class="space-y-4">
        <!-- Search -->
        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Recherche
          </label>
          <div class="relative">
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              [(ngModel)]="searchText"
              (ngModelChange)="onSearchChange()"
              placeholder="Rechercher un événement..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <!-- Categories -->
        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Catégories
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              *ngFor="let category of allCategories"
              (click)="toggleCategory(category.id)"
              [class.ring-2]="isCategorySelected(category.id)"
              [class.ring-offset-2]="isCategorySelected(category.id)"
              [style.border-color]="category.color"
              [class.opacity-50]="!isCategorySelected(category.id) && hasSelectedCategories"
              class="inline-flex items-center space-x-1 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all hover:opacity-100"
              [style.background-color]="isCategorySelected(category.id) ? category.color + '20' : 'transparent'"
            >
              <span
                class="material-icons"
                style="font-size: 14px;"
                [style.color]="category.color"
              >
                {{ category.icon }}
              </span>
              <span [class.text-white]="isCategorySelected(category.id)" class="text-gray-700 dark:text-gray-300">
                {{ category.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- Date range -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Date de début
            </label>
            <input
              type="date"
              [(ngModel)]="dateFrom"
              (ngModelChange)="onDateChange()"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Date de fin
            </label>
            <input
              type="date"
              [(ngModel)]="dateTo"
              (ngModelChange)="onDateChange()"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
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
export class FilterBarComponent implements OnInit {
  allCategories: CategoryInfo[] = [];

  searchText = '';
  dateFrom = '';
  dateTo = '';
  selectedCategories: string[] = [];
  hasActiveFilters = false;
  hasSelectedCategories = false;

  constructor(
    private filterService: FilterService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // S'abonner aux catégories (défaut + personnalisées)
    this.categoryService.allCategories$.subscribe(categories => {
      console.log('FilterBarComponent - Catégories reçues:', categories);
      this.allCategories = categories;
    });

    // S'abonner aux filtres
    this.filterService.filter$.subscribe(filter => {
      this.searchText = filter.searchText;
      this.dateFrom = filter.dateFrom || '';
      this.dateTo = filter.dateTo || '';
      this.selectedCategories = filter.categories;
      this.hasActiveFilters = this.filterService.hasActiveFilters();
      this.hasSelectedCategories = this.selectedCategories.length > 0;
    });
  }

  toggleCategory(categoryId: string): void {
    this.filterService.toggleCategory(categoryId as EventCategory);
  }

  isCategorySelected(categoryId: string): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  onSearchChange(): void {
    this.filterService.setSearchText(this.searchText);
  }

  onDateChange(): void {
    this.filterService.setDateRangeFilter(
      this.dateFrom || undefined,
      this.dateTo || undefined
    );
  }

  resetFilters(): void {
    this.filterService.resetFilters();
    this.searchText = '';
    this.dateFrom = '';
    this.dateTo = '';
  }
}
