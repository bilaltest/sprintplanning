import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '@services/settings.service';
import { CategoryService } from '@services/category.service';
import { BehaviorSubject } from 'rxjs';
import { UserPreferences } from '@models/settings.model';
import { FormsModule } from '@angular/forms';

describe('SettingsComponent', () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;
    let settingsService: any;
    let categoryService: any;

    const mockPreferences: UserPreferences = {
        theme: 'light',
        customCategories: [],
        createdAt: 'date',
        updatedAt: 'date'
    };

    const mockCategories = [
        { id: 'mep', label: 'MEP', color: '#000000', icon: 'icon', isCustom: false },
        { id: 'custom1', label: 'Custom', color: '#ffffff', icon: 'icon', isCustom: true }
    ];

    beforeEach(async () => {
        settingsService = {
            preferences$: new BehaviorSubject(mockPreferences),
            setTheme: jest.fn(),
            resetToDefaults: jest.fn()
        };

        categoryService = {
            allCategories$: new BehaviorSubject(mockCategories),
            addCustomCategory: jest.fn(),
            deleteCustomCategory: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [SettingsComponent, FormsModule],
            providers: [
                { provide: SettingsService, useValue: settingsService },
                { provide: CategoryService, useValue: categoryService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with preferences and categories', () => {
        expect(component.preferences).toEqual(mockPreferences);
        expect(component.allCategories).toEqual(mockCategories);
    });

    it('should set theme', async () => {
        await component.setTheme('dark');
        expect(settingsService.setTheme).toHaveBeenCalledWith('dark');
    });

    it('should reset to defaults', async () => {
        jest.spyOn(window, 'confirm').mockReturnValue(true);
        await component.resetToDefaults();
        expect(settingsService.resetToDefaults).toHaveBeenCalled();
    });

    it('should not reset to defaults if cancelled', async () => {
        jest.spyOn(window, 'confirm').mockReturnValue(false);
        await component.resetToDefaults();
        expect(settingsService.resetToDefaults).not.toHaveBeenCalled();
    });

    it('should filter default categories', () => {
        const defaultCategories = component.getDefaultCategories();
        expect(defaultCategories.length).toBe(1);
        expect(defaultCategories[0].id).toBe('mep');
    });

    it('should add custom category', async () => {
        component.newCategoryLabel = 'New Category';
        component.newCategoryColor = '#000000';

        await component.addCustomCategory();

        expect(categoryService.addCustomCategory).toHaveBeenCalledWith('New Category', '#000000', 'event');
        expect(component.showAddCategoryForm).toBe(false);
    });

    it('should not add custom category if invalid', async () => {
        component.newCategoryLabel = '';
        await component.addCustomCategory();
        expect(categoryService.addCustomCategory).not.toHaveBeenCalled();
    });

    it('should handle error when adding custom category', async () => {
        component.newCategoryLabel = 'Error Category';
        categoryService.addCustomCategory.mockRejectedValue(new Error('Error'));
        jest.spyOn(window, 'alert').mockImplementation(() => { });

        await component.addCustomCategory();

        expect(window.alert).toHaveBeenCalled();
    });

    it('should cancel add category', () => {
        component.showAddCategoryForm = true;
        component.newCategoryLabel = 'Test';

        component.cancelAddCategory();

        expect(component.showAddCategoryForm).toBe(false);
        expect(component.newCategoryLabel).toBe('');
    });

    it('should delete custom category', async () => {
        jest.spyOn(window, 'confirm').mockReturnValue(true);
        await component.deleteCustomCategory('custom1');
        expect(categoryService.deleteCustomCategory).toHaveBeenCalledWith('custom1');
    });

    it('should not delete custom category if cancelled', async () => {
        jest.spyOn(window, 'confirm').mockReturnValue(false);
        await component.deleteCustomCategory('custom1');
        expect(categoryService.deleteCustomCategory).not.toHaveBeenCalled();
    });

    it('should handle error when deleting custom category', async () => {
        jest.spyOn(window, 'confirm').mockReturnValue(true);
        categoryService.deleteCustomCategory.mockRejectedValue(new Error('Error'));
        jest.spyOn(window, 'alert').mockImplementation(() => { });

        await component.deleteCustomCategory('custom1');

        expect(window.alert).toHaveBeenCalled();
    });
});
