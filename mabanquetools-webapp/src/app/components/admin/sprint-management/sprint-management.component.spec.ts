import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SprintManagementComponent } from './sprint-management.component';
import { SprintService } from '@services/sprint.service';
import { EventService } from '@services/event.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
import { of } from 'rxjs';

describe('SprintManagementComponent', () => {
    let component: SprintManagementComponent;
    let fixture: ComponentFixture<SprintManagementComponent>;
    let sprintServiceSpy: { getAllSprints: jest.Mock, createSprint: jest.Mock, updateSprint: jest.Mock, deleteSprint: jest.Mock };
    let eventServiceSpy: { refreshEvents: jest.Mock };

    beforeEach(async () => {
        sprintServiceSpy = {
            getAllSprints: jest.fn().mockReturnValue(of([])),
            createSprint: jest.fn(),
            updateSprint: jest.fn(),
            deleteSprint: jest.fn()
        };
        eventServiceSpy = { refreshEvents: jest.fn() };

        await TestBed.configureTestingModule({
            imports: [SprintManagementComponent],
            providers: [
                { provide: SprintService, useValue: sprintServiceSpy },
                { provide: EventService, useValue: eventServiceSpy },
                { provide: ToastService, useValue: { success: jest.fn(), error: jest.fn(), warning: jest.fn() } },
                { provide: ConfirmationService, useValue: { confirm: jest.fn() } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SprintManagementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
