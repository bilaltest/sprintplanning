import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterService } from '@services/filter.service';
import { CategoryService, CategoryInfo } from '@services/category.service';
import { EventCategory } from '@models/event.model';
import { EventFilter } from '@models/filter.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-planning rounded-xl shadow-lg p-4">
      <div class="flex items-center justify-between gap-4">
        <!-- Label Catégories -->
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Catégories
        </label>

        <!-- Categories badges -->
        <div class="flex flex-wrap gap-2 flex-1">
          <button
            *ngFor="let category of allCategories"
            (click)="toggleCategory(category.id)"
            [class.ring-2]="isCategorySelected(category.id)"
            [class.ring-offset-2]="isCategorySelected(category.id)"
            [style.border-color]="category.color"
            [class.opacity-50]="!isCategorySelected(category.id) && hasSelectedCategories"
            class="inline-flex items-center space-x-1.5 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all hover:opacity-100 hover:shadow-md hover:scale-105 cursor-pointer"
            [style.background-color]="isCategorySelected(category.id) ? category.color + '30' : 'transparent'"
            [class.shadow-sm]="!isCategorySelected(category.id)"
          >
            <span
              class="material-icons"
              style="font-size: 16px;"
              [style.color]="category.color"
            >
              {{ category.icon }}
            </span>
            <span [class.text-gray-900]="isCategorySelected(category.id)" [class.dark:text-white]="isCategorySelected(category.id)" class="text-gray-700 dark:text-gray-300 font-medium">
              {{ category.label }}
            </span>
          </button>
        </div>

        <!-- Reset button -->
        <button
          *ngIf="hasActiveFilters"
          (click)="resetFilters()"
          class="px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-all whitespace-nowrap"
        >
          Réinitialiser
        </button>
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
  selectedCategories: string[] = [];
  hasActiveFilters = false;
  hasSelectedCategories = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    private filterService: FilterService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    // S'abonner aux catégories (défaut + personnalisées)
    this.categoryService.allCategories$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(categories => {
        this.allCategories = categories;
      });

    // S'abonner aux filtres
    this.filterService.filter$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(filter => {
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

  resetFilters(): void {
    this.filterService.resetFilters();
  }
}
