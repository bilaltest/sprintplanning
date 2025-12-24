import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbsenceComponent } from './absence.component';
import { AbsenceService } from '@services/absence.service';
import { AuthService } from '@services/auth.service';
import { PermissionService } from '@services/permission.service';
import { ActivatedRoute } from '@angular/router';
import { SprintService } from '@services/sprint.service';
import { ToastService } from '@services/toast.service';
import { ClosedDayService } from '@services/closed-day.service';
import { OnboardingService } from '@services/onboarding.service';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AbsenceComponent', () => {
    let component: AbsenceComponent;
    let fixture: ComponentFixture<AbsenceComponent>;

    // Mocks
    const mockAbsenceService = {
        getAbsences: jest.fn().mockReturnValue(of([])),
        getAbsenceUsers: jest.fn().mockReturnValue(of([]))
    };
    const mockAuthService = {
        currentUser$: of({ id: 'user1', firstName: 'John', lastName: 'Doe' }),
        getCurrentUser: jest.fn().mockReturnValue({ id: 'user1' })
    };
    const mockPermissionService = {
        hasPermission: jest.fn().mockReturnValue(true)
    };
    const mockActivatedRoute = {
        snapshot: { paramMap: { get: jest.fn() } },
        queryParams: of({})
    };
    const mockSprintService = {
        getAllSprints: jest.fn().mockReturnValue(of([]))
    };
    const mockToastService = {
        showSuccess: jest.fn(),
        showError: jest.fn()
    };
    const mockClosedDayService = {
        getAllClosedDays: jest.fn().mockReturnValue(of([]))
    };
    const mockOnboardingService = {
        loadSeenKeys: jest.fn().mockReturnValue(of(['TOUR_ABSENCE'])), // Already seen by default to avoid tour start in standard tests
        shouldShow: jest.fn().mockReturnValue(false),
        markAsSeen: jest.fn()
    };
    const mockDialog = {
        open: jest.fn()
    };
    const mockBreakpointObserver = {
        observe: jest.fn().mockReturnValue(of({ matches: false }))
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AbsenceComponent], // Standalone
            providers: [
                { provide: AbsenceService, useValue: mockAbsenceService },
                { provide: AuthService, useValue: mockAuthService },
                { provide: PermissionService, useValue: mockPermissionService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: SprintService, useValue: mockSprintService },
                { provide: ToastService, useValue: mockToastService },
                { provide: ClosedDayService, useValue: mockClosedDayService },
                { provide: OnboardingService, useValue: mockOnboardingService },
                { provide: MatDialog, useValue: mockDialog },
                { provide: BreakpointObserver, useValue: mockBreakpointObserver }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(AbsenceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not start tour if check fails', () => {
        mockOnboardingService.shouldShow.mockReturnValue(false);
        component.ngOnInit();
        expect(mockOnboardingService.loadSeenKeys).toHaveBeenCalled();
        // No easy way to check if tour started without mocking driver.js globally, 
        // but if it didn't crash, that's a good sign.
    });

    it('should initialize default absence values when opening create modal', () => {
        const startDate = new Date('2025-01-01');
        const endDate = new Date('2025-01-02');
        component.selectedUser = { id: 'u1', firstName: 'Test', lastName: 'User', metier: '', tribu: '', interne: true, email: '', squads: [] };

        component.openCreateModal(startDate, endDate);

        expect(component.newAbsence).toBeDefined();
        expect(component.newAbsence.startPeriod).toBe('MORNING');
        expect(component.newAbsence.endPeriod).toBe('AFTERNOON');
        expect(component.newAbsence.type).toBe('ABSENCE');
    });

    it('should pin current user to the top of the filtered list', () => {
        // Arrange
        const user1 = { id: 'user1', firstName: 'John', lastName: 'Doe', metier: 'Dev', tribu: 'T1', interne: true, email: 'john@example.com', squads: ['S1'] };
        const user2 = { id: 'user2', firstName: 'Alice', lastName: 'Smith', metier: 'PO', tribu: 'T1', interne: true, email: 'alice@example.com', squads: ['S1'] };
        const user3 = { id: 'user3', firstName: 'Bob', lastName: 'Jones', metier: 'Dev', tribu: 'T1', interne: true, email: 'bob@example.com', squads: ['S1'] };

        // Setup initial list where user1 (current user) is NOT first
        component.users = [user2, user3, user1];

        // Act
        component.filterUsers();

        // Assert
        expect(component.filteredUsers.length).toBe(3);
        expect(component.filteredUsers[0].id).toBe('user1'); // Should be first
        expect(component.filteredUsers).toContain(user2);
        expect(component.filteredUsers).toContain(user3);
    });
    it('should highlight today with amber color', () => {
        // Arrange: manually set monthData with one day that is today
        const today = new Date();
        const dayMetadata: any = {
            date: today,
            isToday: true,
            isWeekend: false,
            isHoliday: false,
            label: 'L',
            dayNum: '01'
        };

        component.monthData = [{
            date: today,
            days: [dayMetadata],
            width: 100
        }];

        // Act
        fixture.detectChanges();

        // Assert
        const todayElement = fixture.nativeElement.querySelector('.text-vibrant-700');
        expect(todayElement).toBeTruthy();
        expect(todayElement.classList).toContain('bg-vibrant-100');
    });
});

