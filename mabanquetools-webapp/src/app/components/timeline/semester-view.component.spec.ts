import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SemesterViewComponent } from './semester-view.component';
import { EventService } from '@services/event.service';
import { TagService } from '@services/tag.service';
import { BehaviorSubject } from 'rxjs';
import { Event } from '@models/event.model';

describe('SemesterViewComponent', () => {
    let component: SemesterViewComponent;
    let fixture: ComponentFixture<SemesterViewComponent>;
    let eventService: any;
    let tagService: any;

    const mockTags = [
        { id: 'tag1', name: 'ios', label: 'iOS', color: '#000000', icon: 'apple', createdAt: '2025-01-01' }
    ];

    const mockEvent: Event = {
        id: '1',
        title: 'Test Event',
        date: '2025-01-01',
        category: 'mep',
        color: '#000000',
        icon: 'icon',
        tags: ['tag1']
    };

    beforeEach(async () => {
        eventService = {};
        tagService = {
            allTags$: new BehaviorSubject(mockTags)
        };

        await TestBed.configureTestingModule({
            imports: [SemesterViewComponent],
            providers: [
                { provide: EventService, useValue: eventService },
                { provide: TagService, useValue: tagService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SemesterViewComponent);
        component = fixture.componentInstance;
        component.currentDate = new Date(2025, 0, 1); // Jan 2025
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load tags on init', () => {
        expect(component.tagsMap.size).toBe(1);
        expect(component.tagsMap.get('tag1')?.label).toBe('iOS');
    });

    it('should get tag color', () => {
        expect(component.getTagColor('tag1')).toBe('#000000');
        expect(component.getTagColor('nonexistent')).toBe('#ccc');
    });

    it('should get tag label', () => {
        expect(component.getTagLabel('tag1')).toBe('iOS');
        expect(component.getTagLabel('nonexistent')).toBe('');
    });

    it('should update view and generate months', () => {
        component.updateView();
        expect(component.months.length).toBe(6);
        expect(component.months[0].name.toLowerCase()).toBe('janvier');
        expect(component.semesterLabel).toContain('Semestre 1 - 2025');
    });

    it('should filter events for day', () => {
        component.events = [mockEvent];
        component.updateView();

        // Find Jan 1st cell
        const janMonth = component.months[0];
        const jan1 = janMonth.cells.find(c => c.dayNumber === 1);

        expect(jan1).toBeDefined();
        if (jan1) {
            expect(jan1.events.length).toBe(1);
            expect(jan1.events[0].title).toBe('Test Event');
        }
    });
    it('should emit ready event after view init but NOT scroll', () => {
        jest.useFakeTimers();
        const readySpy = jest.spyOn(component.ready, 'emit');
        const scrollSpy = jest.spyOn(component, 'scrollToToday');

        component.ngAfterViewInit();
        jest.advanceTimersByTime(500);

        expect(readySpy).toHaveBeenCalled();
        expect(scrollSpy).not.toHaveBeenCalled();
        jest.useRealTimers();
    });
});
