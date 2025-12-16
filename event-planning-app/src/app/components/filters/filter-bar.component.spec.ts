import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterBarComponent } from './filter-bar.component';
import { FilterService } from '@services/filter.service';
import { CategoryService } from '@services/category.service';
import { BehaviorSubject, of } from 'rxjs';
import { EventCategory } from '@models/event.model';

describe('FilterBarComponent', () => {
    let component: FilterBarComponent;
    let fixture: ComponentFixture<FilterBarComponent>;
    let filterService: any;
    let categoryService: any;

    const mockCategories = [
        { id: 'mep', label: 'MEP', color: '#000000', icon: 'icon' },
        { id: 'autre', label: 'Autre', color: '#ffffff', icon: 'icon' }
    ];

    beforeEach(async () => {
        filterService = {
            filter$: new BehaviorSubject({ categories: [] }),
            hasActiveFilters: jest.fn().mockReturnValue(false),
            toggleCategory: jest.fn(),
            resetFilters: jest.fn()
        };

        categoryService = {
            allCategories$: new BehaviorSubject(mockCategories)
        };

        await TestBed.configureTestingModule({
            imports: [FilterBarComponent],
            providers: [
                { provide: FilterService, useValue: filterService },
                { provide: CategoryService, useValue: categoryService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FilterBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with categories', () => {
        expect(component.allCategories).toEqual(mockCategories);
    });

    it('should update selected categories from filter service', () => {
        const selectedCategories = ['mep'];
        filterService.filter$.next({ categories: selectedCategories });
        fixture.detectChanges();

        expect(component.selectedCategories).toEqual(selectedCategories);
        expect(component.hasSelectedCategories).toBe(true);
    });

    it('should toggle category', () => {
        const categoryId = 'mep';
        component.toggleCategory(categoryId);
        expect(filterService.toggleCategory).toHaveBeenCalledWith(categoryId);
    });

    it('should check if category is selected', () => {
        component.selectedCategories = ['mep'];
        expect(component.isCategorySelected('mep')).toBe(true);
        expect(component.isCategorySelected('autre')).toBe(false);
    });

    it('should reset filters', () => {
        component.resetFilters();
        expect(filterService.resetFilters).toHaveBeenCalled();
    });

    it('should check category selection', () => {
        filterService.category$ = of('mep');
        component.ngOnInit();
        expect(component.isCategorySelected('mep')).toBe(true);
        expect(component.isCategorySelected('hotfix')).toBe(false);
    });
});
