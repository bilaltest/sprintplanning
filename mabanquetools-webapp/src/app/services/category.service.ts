import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { SettingsService } from './settings.service';
import {
  EventCategory,
  EVENT_CATEGORY_LABELS,
  CATEGORY_DEFAULTS,
  CATEGORY_COLORS_DARK
} from '@models/event.model';
import { CustomCategory } from '@models/settings.model';

export interface CategoryInfo {
  id: string;
  label: string;
  color: string;
  icon: string;
  isCustom: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private defaultCategories: EventCategory[] = [
    'mep', 'hotfix', 'maintenance', 'pi_planning',
    'sprint_start', 'code_freeze', 'psi', 'other'
  ];

  // Observable qui combine les catégories par défaut + personnalisées
  public allCategories$: Observable<CategoryInfo[]>;

  constructor(private settingsService: SettingsService) {
    // Combiner les catégories par défaut et les catégories personnalisées
    this.allCategories$ = this.settingsService.preferences$.pipe(
      map(prefs => {
        const categories: CategoryInfo[] = [];

        // Ajouter les catégories par défaut
        this.defaultCategories.forEach(cat => {
          categories.push({
            id: cat,
            label: EVENT_CATEGORY_LABELS[cat],
            color: CATEGORY_DEFAULTS[cat].color,
            icon: CATEGORY_DEFAULTS[cat].icon,
            isCustom: false
          });
        });

        // Ajouter les catégories personnalisées
        prefs.customCategories.forEach(customCat => {
          categories.push({
            id: customCat.id,
            label: customCat.label,
            color: customCat.color,
            icon: customCat.icon,
            isCustom: true
          });
        });

        return categories;
      })
    );
  }

  // Obtenir toutes les catégories (synchrone)
  getAllCategoriesSync(): CategoryInfo[] {
    const prefs = this.settingsService.getCurrentPreferences();
    const categories: CategoryInfo[] = [];

    // Catégories par défaut
    this.defaultCategories.forEach(cat => {
      categories.push({
        id: cat,
        label: EVENT_CATEGORY_LABELS[cat],
        color: CATEGORY_DEFAULTS[cat].color,
        icon: CATEGORY_DEFAULTS[cat].icon,
        isCustom: false
      });
    });

    // Catégories personnalisées
    prefs.customCategories.forEach(customCat => {
      categories.push({
        id: customCat.id,
        label: customCat.label,
        color: customCat.color,
        icon: customCat.icon,
        isCustom: true
      });
    });

    return categories;
  }

  // Obtenir les IDs de toutes les catégories
  getAllCategoryIds(): string[] {
    return this.getAllCategoriesSync().map(cat => cat.id);
  }

  // Obtenir une catégorie par son ID
  getCategoryById(id: string): CategoryInfo | undefined {
    return this.getAllCategoriesSync().find(cat => cat.id === id);
  }

  // Obtenir le label d'une catégorie
  getCategoryLabel(id: string): string {
    const category = this.getCategoryById(id);
    return category ? category.label : id;
  }

  // Obtenir la couleur d'une catégorie
  getCategoryColor(id: string): string {
    const category = this.getCategoryById(id);
    return category ? category.color : '#8b5cf6';
  }

  // Obtenir l'icône d'une catégorie
  getCategoryIcon(id: string): string {
    const category = this.getCategoryById(id);
    return category ? category.icon : 'event';
  }

  // Ajouter une catégorie personnalisée
  async addCustomCategory(label: string, color: string, icon: string): Promise<CustomCategory> {
    const customCategory: CustomCategory = {
      id: `custom_${Date.now()}`,
      name: label.toLowerCase().replace(/\s+/g, '_'),
      label,
      color,
      icon,
      createdAt: new Date().toISOString()
    };

    const prefs = this.settingsService.getCurrentPreferences();
    const updatedPrefs = {
      ...prefs,
      customCategories: [...prefs.customCategories, customCategory]
    };

    await this.settingsService.updatePreferences(updatedPrefs);
    return customCategory;
  }

  // Supprimer une catégorie personnalisée
  async deleteCustomCategory(id: string): Promise<void> {
    const prefs = this.settingsService.getCurrentPreferences();
    const updatedPrefs = {
      ...prefs,
      customCategories: prefs.customCategories.filter(cat => cat.id !== id)
    };

    await this.settingsService.updatePreferences(updatedPrefs);
  }

  // Mettre à jour une catégorie personnalisée
  async updateCustomCategory(id: string, updates: Partial<CustomCategory>): Promise<void> {
    const prefs = this.settingsService.getCurrentPreferences();
    const updatedPrefs = {
      ...prefs,
      customCategories: prefs.customCategories.map(cat =>
        cat.id === id ? { ...cat, ...updates } : cat
      )
    };

    await this.settingsService.updatePreferences(updatedPrefs);
  }
}
