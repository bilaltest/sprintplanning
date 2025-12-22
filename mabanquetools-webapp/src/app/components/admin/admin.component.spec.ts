import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { AdminComponent } from './admin.component';
import { ToastService } from '@services/toast.service';
import { SidebarService } from '@services/sidebar.service';
import { ConfirmationService } from '@services/confirmation.service';
import { Component } from '@angular/core';
import { of } from 'rxjs';

// Real Components (to be removed from imports)
import { UserManagementComponent } from './user-management/user-management.component';
import { SprintManagementComponent } from './sprint-management/sprint-management.component';
import { ClosedDayManagementComponent } from './closed-days/closed-day-management.component';

// Mock Child Components
@Component({ selector: 'app-user-management', standalone: true, template: '' })
class MockUserManagementComponent { }
@Component({ selector: 'app-sprint-management', standalone: true, template: '' })
class MockSprintManagementComponent { }
@Component({ selector: 'app-closed-day-management', standalone: true, template: '' })
class MockClosedDayManagementComponent { }

describe('AdminComponent', () => {
    let component: AdminComponent;
    let fixture: ComponentFixture<AdminComponent>;
    let httpClientSpy: { get: jest.Mock, post: jest.Mock, delete: jest.Mock };
    let toastServiceSpy: { success: jest.Mock, error: jest.Mock };
    let sidebarServiceSpy: { closeSidebar: jest.Mock };
    let confirmationServiceSpy: { confirm: jest.Mock };

    beforeEach(async () => {
        httpClientSpy = { get: jest.fn(), post: jest.fn(), delete: jest.fn() };
        toastServiceSpy = { success: jest.fn(), error: jest.fn() };
        sidebarServiceSpy = { closeSidebar: jest.fn() };
        confirmationServiceSpy = { confirm: jest.fn() };

        await TestBed.configureTestingModule({
            imports: [AdminComponent, MockUserManagementComponent, MockSprintManagementComponent, MockClosedDayManagementComponent],
            providers: [
                { provide: HttpClient, useValue: httpClientSpy },
                { provide: ToastService, useValue: toastServiceSpy },
                { provide: SidebarService, useValue: sidebarServiceSpy },
                { provide: ConfirmationService, useValue: confirmationServiceSpy }
            ]
        })
            .overrideComponent(AdminComponent, {
                remove: { imports: [UserManagementComponent, SprintManagementComponent, ClosedDayManagementComponent] },
                add: { imports: [MockUserManagementComponent, MockSprintManagementComponent, MockClosedDayManagementComponent] }
            })
            .compileComponents();

        fixture = TestBed.createComponent(AdminComponent);
        component = fixture.componentInstance;

        // Mock loadStats which is called on init
        httpClientSpy.get.mockReturnValue(of({ stats: {} }));

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call export database', async () => {
        const mockBlob = new Blob(['{}'], { type: 'application/json' });
        httpClientSpy.get.mockReturnValue(of(mockBlob));
        // Mock URL.createObjectURL and revokeObjectURL
        global.URL.createObjectURL = jest.fn(() => 'blob:url');
        global.URL.revokeObjectURL = jest.fn();

        // Mock document.createElement logic for link click
        const linkSpy = { click: jest.fn(), href: '', download: '' };
        jest.spyOn(document, 'createElement').mockReturnValue(linkSpy as any);

        await component.exportDatabase();

        expect(httpClientSpy.get).toHaveBeenCalledWith(expect.stringContaining('/export'), expect.anything());
        expect(toastServiceSpy.success).toHaveBeenCalled();
    });
});
