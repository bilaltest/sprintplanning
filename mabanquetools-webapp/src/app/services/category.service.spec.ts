import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { SettingsService } from './settings.service';
import { BehaviorSubject } from 'rxjs';
import { EVENT_CATEGORY_LABELS, CATEGORY_DEFAULTS } from '@models/event.model';
import { UserPreferences } from '@models/settings.model';

describe('CategoryService', () => {
    let service: CategoryService;

    const initialPrefs: UserPreferences = {
        theme: 'light',
        startOfWeek: 'monday',
        defaultView: 'month',
        showWeekNumbers: true,
        workingDays: [1, 2, 3, 4, 5],
        workingHours: { start: '09:00', end: '18:00' },
        customCategories: [
            { id: 'custom1', label: 'Custom 1', color: '#123456', icon: 'star', isCustom: true }
        ]
    };

    const prefsSubject = new BehaviorSubject<UserPreferences>(initialPrefs);

    const settingsServiceMock = {
        preferences$: prefsSubject.asObservable(),
        getCurrentPreferences: jest.fn().mockReturnValue(initialPrefs)
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CategoryService,
                { provide: SettingsService, useValue: settingsServiceMock }
            ]
        });
        service = TestBed.inject(CategoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should combine default and custom categories in allCategories$', (done) => {
        service.allCategories$.subscribe(categories => {
            // 4 default + 1 custom = 5
            expect(categories.length).toBe(5);

            const custom = categories.find(c => c.id === 'custom1');
            expect(custom).toBeTruthy();
            expect(custom?.label).toBe('Custom 1');

            const mepBack = categories.find(c => c.id === 'mep_back');
            expect(mepBack).toBeTruthy();
            expect(mepBack?.label).toBe(EVENT_CATEGORY_LABELS['mep_back']);

            done();
        });
    });

    it('should get all categories sync', () => {
        const categories = service.getAllCategoriesSync();
        expect(categories.length).toBe(5);
        expect(categories.find(c => c.id === 'custom1')).toBeTruthy();
    });

    it('should get all category ids', () => {
        const ids = service.getAllCategoryIds();
        expect(ids).toContain('mep_front');
        expect(ids).toContain('custom1');
        expect(ids.length).toBe(5);
    });

    it('should get category by id', () => {
        const cat = service.getCategoryById('hotfix');
        expect(cat).toBeTruthy();
        expect(cat?.id).toBe('hotfix');

        const custom = service.getCategoryById('custom1');
        expect(custom).toBeTruthy();
        expect(custom?.id).toBe('custom1');

        const unknown = service.getCategoryById('unknown');
        expect(unknown).toBeUndefined();
    });

    it('should get category label', () => {
        expect(service.getCategoryLabel('mep_front')).toBe(EVENT_CATEGORY_LABELS['mep_front']);
        expect(service.getCategoryLabel('custom1')).toBe('Custom 1');
        expect(service.getCategoryLabel('unknown')).toBe('unknown');
    });

    it('should get category color', () => {
        expect(service.getCategoryColor('mep_front')).toBe(CATEGORY_DEFAULTS['mep_front'].color);
        expect(service.getCategoryColor('custom1')).toBe('#123456');
        // Updated fallback expectation
        expect(service.getCategoryColor('unknown')).toBe('#8b5cf6');
    });

    it('should get category icon', () => {
        expect(service.getCategoryIcon('mep_front')).toBe(CATEGORY_DEFAULTS['mep_front'].icon);
        expect(service.getCategoryIcon('custom1')).toBe('star');
        // Updated fallback expectation
        expect(service.getCategoryIcon('unknown')).toBe('event');
    });
});
