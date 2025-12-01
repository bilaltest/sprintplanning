import { Component, OnInit, DestroyRef, inject, HostListener } from '@angular/core';
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
    <div
      class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300"
      [style.height]="isCollapsed ? '0px' : 'auto'"
      [style.overflow]="isCollapsed ? 'hidden' : 'visible'"
      [class.p-3]="!isCollapsed"
    >
      <!-- Toggle button (visible only when sticky and scrolled) -->
      <button
        *ngIf="isSticky"
        (click)="onToggleCollapse()"
        class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b-lg px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md z-30"
        title="{{ isCollapsed ? 'Afficher les filtres' : 'Masquer les filtres' }}"
      >
        <span class="material-icons text-sm">
          {{ isCollapsed ? 'expand_more' : 'expand_less' }}
        </span>
      </button>

      <div class="flex items-center justify-between gap-4">
        <!-- Label Catégories -->
        <label class="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
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
            class="inline-flex items-center space-x-1 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all hover:opacity-100 hover:shadow-md cursor-pointer"
            [style.background-color]="isCategorySelected(category.id) ? category.color + '20' : 'transparent'"
            [class.shadow-sm]="!isCategorySelected(category.id)"
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

        <!-- Reset button -->
        <button
          *ngIf="hasActiveFilters"
          (click)="resetFilters()"
          class="text-xs text-primary-600 dark:text-primary-400 hover:underline whitespace-nowrap"
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
  isSticky = false;
  isCollapsed = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    private filterService: FilterService,
    private categoryService: CategoryService
  ) {}

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

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isSticky = window.scrollY > 100;
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

  onToggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
