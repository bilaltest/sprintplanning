import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TimelineContainerComponent } from './timeline-container.component';
import { TimelineService } from '@services/timeline.service';
import { EventService } from '@services/event.service';
import { FilterService } from '@services/filter.service';
import { CategoryService } from '@services/category.service';
import { ExportService } from '@services/export.service';
import { ToastService } from '@services/toast.service';
import { SprintService } from '@services/sprint.service';
import { BehaviorSubject, of } from 'rxjs';
import { TimelineState } from '@models/timeline.model';
import { Event } from '@models/event.model';
import { Sprint } from '@models/sprint.model';
import { OnboardingService } from '@services/onboarding.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FilterBarComponent } from '../filters/filter-bar.component';
import { SemesterViewComponent } from './semester-view.component';
import { NowViewComponent } from './now-view.component';
import { EventModalComponent } from '../modals/event-modal.component';

jest.mock('jspdf', () => ({
    jsPDF: class { }
}));

jest.mock('html2canvas', () => jest.fn());

@Component({
    selector: 'app-filter-bar',
    standalone: true,
    template: ''
})
class MockFilterBarComponent { }

@Component({
    selector: 'app-semester-view',
    standalone: true,
    template: ''
})
class MockSemesterViewComponent {
    @Input() events: Event[] = [];
    @Input() sprints: Sprint[] = [];
    @Input() closedDays: any[] = [];
    @Output() eventClick = new EventEmitter<Event>();
    @Output() addEventClick = new EventEmitter<string>();
}

@Component({
    selector: 'app-now-view',
    standalone: true,
    template: ''
})
class MockNowViewComponent {
    @Input() events: Event[] | null = [];
    @Output() eventClick = new EventEmitter<Event>();
    @Output() addEventClick = new EventEmitter<string>();
    @Output() deleteEventClick = new EventEmitter<Event>();
}

@Component({
    selector: 'app-event-modal',
    standalone: true,
    template: ''
})
class MockEventModalComponent {
    @Input() event?: Event;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<Event>();
}

describe('TimelineContainerComponent', () => {
    let component: TimelineContainerComponent;
    let fixture: ComponentFixture<TimelineContainerComponent>;
    let timelineService: any;
    let eventService: any;
    let filterService: any;
    let categoryService: any;
    let exportService: any;
    let toastService: any;
    let sprintService: any;
    let onboardingService: any;
    let matDialog: any;

    const mockTimelineState: TimelineState = {
        view: 'semester',
        currentDate: new Date(2025, 0, 1)
    };

    const mockEvents: Event[] = [
        {
            id: '1',
            title: 'Test Event',
            date: '2025-01-15',
            startTime: '10:00',
            endTime: '11:00',
            category: 'mep',
            color: '#22c55e',
            icon: 'rocket_launch',
            description: 'Test description',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z'
        }
    ];

    beforeEach(async () => {
        timelineService = {
            state$: new BehaviorSubject(mockTimelineState),
            setView: jest.fn(),
            previousPeriod: jest.fn(),
            nextPeriod: jest.fn(),
            goToToday: jest.fn(),
            getCurrentState: jest.fn().mockReturnValue(mockTimelineState),
            setCurrentDate: jest.fn()
        };

        eventService = {
            deleteEvent: jest.fn().mockResolvedValue(undefined),
            events$: new BehaviorSubject(mockEvents)
        };

        filterService = {
            filteredEvents$: new BehaviorSubject(mockEvents),
            filter$: new BehaviorSubject({ categories: [] }),
            hasActiveFilters: jest.fn().mockReturnValue(false)
        };

        categoryService = {
            allCategories$: new BehaviorSubject([])
        };

        exportService = {
            exportAsPDF: jest.fn().mockResolvedValue(undefined),
            exportAsPNG: jest.fn().mockResolvedValue(undefined),
            exportAsJSON: jest.fn().mockResolvedValue(undefined),
            exportAsCSV: jest.fn().mockResolvedValue(undefined)
        };

        toastService = {
            info: jest.fn(),
            success: jest.fn(),
            error: jest.fn(),
            warning: jest.fn()
        };

        sprintService = {
            getAllSprints: jest.fn().mockReturnValue(of([]))
        };

        onboardingService = {
            loadSeenKeys: jest.fn().mockReturnValue(of([])),
            shouldShow: jest.fn().mockReturnValue(false),
            markAsSeen: jest.fn()
        };

        matDialog = {
            open: jest.fn()
        };



        await TestBed.configureTestingModule({
            imports: [TimelineContainerComponent, HttpClientTestingModule],
            providers: [
                { provide: TimelineService, useValue: timelineService },
                { provide: EventService, useValue: eventService },
                { provide: FilterService, useValue: filterService },
                { provide: CategoryService, useValue: categoryService },
                { provide: ExportService, useValue: exportService },
                { provide: ToastService, useValue: toastService },
                { provide: SprintService, useValue: sprintService },
                { provide: OnboardingService, useValue: onboardingService },
                { provide: MatDialog, useValue: matDialog },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of({})
                    }
                }
            ]
        })
            .overrideComponent(TimelineContainerComponent, {
                remove: {
                    imports: [
                        FilterBarComponent,
                        SemesterViewComponent,
                        NowViewComponent,
                        EventModalComponent
                    ]
                },
                add: {
                    imports: [
                        MockFilterBarComponent,
                        MockSemesterViewComponent,
                        MockNowViewComponent,
                        MockEventModalComponent
                    ]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(TimelineContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set view', () => {
        component.setView('now');
        expect(timelineService.setView).toHaveBeenCalledWith('now');
    });

    it('should navigate to today', () => {
        component.goToToday();
        expect(timelineService.goToToday).toHaveBeenCalled();
    });



    it('should handle event modal', () => {
        component.openCreateEventModal();
        expect(component.showEventModal).toBe(true);
        expect(component.selectedEvent).toBeUndefined();

        component.closeEventModal();
        expect(component.showEventModal).toBe(false);
    });

    it('should open create modal with date', () => {
        const date = '2025-01-20';
        component.openCreateEventModalWithDate(date);
        expect(component.showEventModal).toBe(true);
        expect(component.selectedEvent?.date).toBe(date);
    });

    it('should open edit modal', () => {
        const event = mockEvents[0];
        component.openEditEventModal(event);
        expect(component.showEventModal).toBe(true);
        expect(component.selectedEvent).toEqual(event);
    });

    it('should handle event save', () => {
        component.showEventModal = true;
        component.handleEventSave(mockEvents[0]);
        expect(component.showEventModal).toBe(false);
    });

    it('should handle delete event', async () => {
        const event = mockEvents[0];
        await component.handleDeleteEvent(event);
        expect(eventService.deleteEvent).toHaveBeenCalledWith(event.id);
    });

    it('should toggle export menu', () => {
        expect(component.showExportMenu).toBe(false);
        component.toggleExportMenu();
        expect(component.showExportMenu).toBe(true);
    });

    it('should handle export actions', async () => {
        await component.exportAsPDF();
        expect(exportService.exportAsPDF).toHaveBeenCalled();
        expect(toastService.success).toHaveBeenCalled();

        await component.exportAsPNG();
        expect(exportService.exportAsPNG).toHaveBeenCalled();

        await component.exportAsJSON();
        expect(exportService.exportAsJSON).toHaveBeenCalled();

        await component.exportAsCSV();
        expect(exportService.exportAsCSV).toHaveBeenCalled();
    });


});
