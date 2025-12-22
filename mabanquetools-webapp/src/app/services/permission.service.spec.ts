import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { User } from './auth.service';

describe('PermissionService', () => {
    let service: PermissionService;
    let httpMock: HttpTestingController;
    let authService: AuthService;

    const mockUser: User = {
        id: '1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        themePreference: 'light',
        widgetOrder: '[]',
        permissions: {
            CALENDAR: 'READ',
            RELEASES: 'WRITE',
            ADMIN: 'NONE',
            ABSENCE: 'READ',
            PLAYGROUND: 'NONE'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Mock AuthService
    // We need to return an Observable for currentUser$ because the service subscribes to it in constructor
    const authServiceMock = {
        getCurrentUser: jest.fn().mockReturnValue(mockUser),
        isAuthenticated: jest.fn().mockReturnValue(true),
        currentUser$: { subscribe: (fn: (user: User) => void) => fn(mockUser) }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                PermissionService,
                { provide: AuthService, useValue: authServiceMock }
            ]
        });
        service = TestBed.inject(PermissionService);
        httpMock = TestBed.inject(HttpTestingController);
        authService = TestBed.inject(AuthService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should check permission correctly', () => {
        expect(service.hasReadAccess('CALENDAR')).toBe(true);
        // write access check
        expect(service.hasWriteAccess('CALENDAR')).toBe(false);
        expect(service.hasWriteAccess('RELEASES')).toBe(true);
    });

    it('should return Disabled Tooltip', () => {
        const tooltip = service.getDisabledTooltip('CALENDAR', 'write');
        expect(tooltip).toContain('Vous n\'avez pas les permissions');
    });
});
