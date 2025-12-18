import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { SettingsService } from './settings.service';
import { BehaviorSubject } from 'rxjs';
import { UserPreferences } from '@models/settings.model';

describe('CategoryService', () => {
    let service: CategoryService;
    let settingsService: any;
    let preferencesSubject: BehaviorSubject<UserPreferences>;

    const mockPreferences: UserPreferences = {
        theme: 'light',
        customCategories: [
            { id: 'custom1', name: 'custom', label: 'Custom', color: '#000000', icon: 'icon', createdAt: 'date' }
        ],
        createdAt: 'date',
        updatedAt: 'date'
    };

    beforeEach(() => {
        preferencesSubject = new BehaviorSubject<UserPreferences>(mockPreferences);
        settingsService = {
            preferences$: preferencesSubject.asObservable(),
            getCurrentPreferences: jest.fn().mockReturnValue(mockPreferences),
            updatePreferences: jest.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                CategoryService,
                { provide: SettingsService, useValue: settingsService }
            ]
        });
        service = TestBed.inject(CategoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all categories sync', () => {
        const categories = service.getAllCategoriesSync();
        expect(categories.length).toBeGreaterThan(0);
        expect(categories.find(c => c.id === 'mep')).toBeTruthy();
        expect(categories.find(c => c.id === 'custom1')).toBeTruthy();
    });

    it('should get all category ids', () => {
        const ids = service.getAllCategoryIds();
        expect(ids).toContain('mep');
        expect(ids).toContain('custom1');
    });

    it('should get category by id', () => {
        const category = service.getCategoryById('mep');
        expect(category).toBeTruthy();
        expect(category?.label).toBe('Mise en production');
    });

    it('should get category label', () => {
        expect(service.getCategoryLabel('mep')).toBe('Mise en production');
        expect(service.getCategoryLabel('unknown')).toBe('unknown');
    });

    it('should get category color', () => {
        expect(service.getCategoryColor('custom1')).toBe('#000000');
        expect(service.getCategoryColor('unknown')).toBe('#8b5cf6');
    });

    it('should get category icon', () => {
        expect(service.getCategoryIcon('custom1')).toBe('icon');
        expect(service.getCategoryIcon('unknown')).toBe('event');
    });

    it('should add custom category', async () => {
        await service.addCustomCategory('New', '#ffffff', 'new-icon');
        expect(settingsService.updatePreferences).toHaveBeenCalled();
        const args = settingsService.updatePreferences.mock.calls[0][0];
        expect(args.customCategories.length).toBe(2);
        expect(args.customCategories[1].label).toBe('New');
    });

    it('should delete custom category', async () => {
        await service.deleteCustomCategory('custom1');
        expect(settingsService.updatePreferences).toHaveBeenCalled();
        const args = settingsService.updatePreferences.mock.calls[0][0];
        expect(args.customCategories.length).toBe(0);
    });

    it('should update custom category', async () => {
        await service.updateCustomCategory('custom1', { label: 'Updated' });
        expect(settingsService.updatePreferences).toHaveBeenCalled();
        const args = settingsService.updatePreferences.mock.calls[0][0];
        expect(args.customCategories[0].label).toBe('Updated');
    });
});
