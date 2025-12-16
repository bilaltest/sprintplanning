import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventModalComponent } from './event-modal.component';
import { EventService } from '@services/event.service';
import { CategoryService } from '@services/category.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
import { BehaviorSubject } from 'rxjs';
import { Event } from '@models/event.model';
import { FormsModule } from '@angular/forms';

describe('EventModalComponent', () => {
    let component: EventModalComponent;
    let fixture: ComponentFixture<EventModalComponent>;
    let eventService: any;
    let categoryService: any;
    let toastService: any;
    let confirmationService: any;

    const mockCategories = [
        { id: 'mep', label: 'MEP', color: '#000000', icon: 'icon' },
        { id: 'autre', label: 'Autre', color: '#ffffff', icon: 'icon' }
    ];

    const mockEvent: Event = {
        id: '1',
        title: 'Test Event',
        date: '2025-01-01',
        startTime: '10:00',
        endTime: '11:00',
        category: 'mep',
        color: '#000000',
        icon: 'icon',
        description: 'desc',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
    };

    beforeEach(async () => {
        eventService = {
            createEvent: jest.fn().mockResolvedValue(mockEvent),
            updateEvent: jest.fn().mockResolvedValue(mockEvent),
            deleteEvent: jest.fn().mockResolvedValue(undefined)
        };

        categoryService = {
            allCategories$: new BehaviorSubject(mockCategories),
            getCategoryById: jest.fn().mockReturnValue(mockCategories[0])
        };

        toastService = {
            success: jest.fn(),
            error: jest.fn()
        };

        confirmationService = {
            confirm: jest.fn().mockResolvedValue(true)
        };

        await TestBed.configureTestingModule({
            imports: [EventModalComponent, FormsModule],
            providers: [
                { provide: EventService, useValue: eventService },
                { provide: CategoryService, useValue: categoryService },
                { provide: ToastService, useValue: toastService },
                { provide: ConfirmationService, useValue: confirmationService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(EventModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize in create mode by default', () => {
        expect(component.isEditMode).toBe(false);
        expect(component.formData.title).toBe('');
    });

    it('should initialize in edit mode when event is provided', () => {
        component.event = mockEvent;
        component.ngOnInit();
        expect(component.isEditMode).toBe(true);
        expect(component.formData.title).toBe(mockEvent.title);
    });

    it('should select category', () => {
        component.selectCategory('mep');
        expect(component.formData.category).toBe('mep');
        expect(component.formData.color).toBe(mockCategories[0].color);
    });

    it('should validate form', () => {
        component.formData.title = '';
        component.formData.date = '';
        expect(component.isFormValid()).toBe(false);

        component.formData.title = 'Test';
        component.formData.date = '2025-01-01';
        expect(component.isFormValid()).toBe(true);
    });

    it('should create event on submit', async () => {
        component.formData = {
            title: 'New Event',
            date: '2025-01-01',
            endDate: '',
            category: 'mep',
            color: '#000000',
            icon: 'icon',
            description: ''
        };

        await component.onSubmit();

        expect(eventService.createEvent).toHaveBeenCalled();
        expect(toastService.success).toHaveBeenCalled();
    });

    it('should update event on submit in edit mode', async () => {
        component.event = mockEvent;
        component.ngOnInit();

        await component.onSubmit();

        expect(eventService.updateEvent).toHaveBeenCalled();
        expect(toastService.success).toHaveBeenCalled();
    });

    it('should delete event', async () => {
        component.event = mockEvent;
        component.ngOnInit();

        await component.onDelete();

        expect(confirmationService.confirm).toHaveBeenCalled();
        expect(eventService.deleteEvent).toHaveBeenCalledWith(mockEvent.id);
        expect(toastService.success).toHaveBeenCalled();
    });

    it('should not delete event if not confirmed', async () => {
        component.event = mockEvent;
        component.ngOnInit();
        confirmationService.confirm.mockResolvedValue(false);

        await component.onDelete();

        expect(eventService.deleteEvent).not.toHaveBeenCalled();
    });

    it('should emit close on overlay click', () => {
        jest.spyOn(component.close, 'emit');
        component.onOverlayClick(new MouseEvent('click'));
        expect(component.close.emit).toHaveBeenCalled();
    });
});
