import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';
import { EventService } from './event.service';
import { BehaviorSubject } from 'rxjs';

describe('FilterService', () => {
    let service: FilterService;

    const eventServiceMock = {
        events$: new BehaviorSubject([])
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                FilterService,
                { provide: EventService, useValue: eventServiceMock }
            ]
        });
        service = TestBed.inject(FilterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default filters', () => {
        service.filter$.subscribe(filters => {
            expect(filters.categories).toEqual([]);
        });
    });

    it('should toggle category', () => {
        service.toggleCategory('cat1' as any);
        expect(service.getCurrentFilter().categories).toContain('cat1');

        service.toggleCategory('cat1' as any);
        expect(service.getCurrentFilter().categories).not.toContain('cat1');
    });

    it('should check if category is active', () => {
        service.resetFilters();
        service.toggleCategory('mep' as any);
        expect(service.hasActiveFilters()).toBe(true);
    });

    it('should clear filters', () => {
        service.toggleCategory('cat1' as any);

        service.resetFilters();

        expect(service.getCurrentFilter().categories).toEqual([]);
    });
});
