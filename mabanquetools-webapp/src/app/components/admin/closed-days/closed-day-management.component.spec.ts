import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClosedDayManagementComponent } from './closed-day-management.component';
import { ClosedDayService } from '@services/closed-day.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
import { of } from 'rxjs';

describe('ClosedDayManagementComponent', () => {
    let component: ClosedDayManagementComponent;
    let fixture: ComponentFixture<ClosedDayManagementComponent>;
    let closedDayServiceSpy: { getAllClosedDays: jest.Mock, createClosedDay: jest.Mock, deleteClosedDay: jest.Mock };

    beforeEach(async () => {
        closedDayServiceSpy = {
            getAllClosedDays: jest.fn().mockReturnValue(of([])),
            createClosedDay: jest.fn(),
            deleteClosedDay: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [ClosedDayManagementComponent],
            providers: [
                { provide: ClosedDayService, useValue: closedDayServiceSpy },
                { provide: ToastService, useValue: { success: jest.fn(), error: jest.fn() } },
                { provide: ConfirmationService, useValue: { confirm: jest.fn() } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ClosedDayManagementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
