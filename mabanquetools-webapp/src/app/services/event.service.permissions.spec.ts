import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventService } from './event.service';
import { PermissionService } from './permission.service';
import { environment } from '../../environments/environment';

describe('EventService - Permission Checks', () => {
    let service: EventService;
    let httpMock: HttpTestingController;
    let permissionService: jest.Mocked<Partial<PermissionService>>;
    const apiUrl = `${environment.apiUrl}/events`;

    beforeEach(() => {
        // Create mock for PermissionService
        permissionService = {
            hasReadAccess: jest.fn(),
            hasWriteAccess: jest.fn(),
            getCurrentUserPermissions: jest.fn(),
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                EventService,
                { provide: PermissionService, useValue: permissionService }
            ]
        });

        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        if (httpMock) {
            httpMock.verify();
        }
    });

    it('should NOT load events on init if user has no CALENDAR permission', fakeAsync(() => {
        // Mock: User has NO permission
        permissionService.hasReadAccess!.mockReturnValue(false);

        // Create service (will trigger constructor)
        service = TestBed.inject(EventService);

        // Wait for setTimeout to execute
        tick();

        // Verify NO HTTP call was made
        httpMock.expectNone(apiUrl);

        // Verify error state is null (silent fail)
        service.error$.subscribe(error => {
            expect(error).toBeNull();
        });
    }));

    it('should load events on init if user has CALENDAR READ permission', fakeAsync(() => {
        // Mock: User has READ permission
        permissionService.hasReadAccess!.mockReturnValue(true);

        // Create service (will trigger constructor)
        service = TestBed.inject(EventService);

        // Wait for setTimeout to execute
        tick();

        // Verify HTTP call was made
        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    }));

    it('should NOT call API in loadEvents if user has no permission', fakeAsync(() => {
        // Mock: User has permission initially (for constructor)
        permissionService.hasReadAccess!.mockReturnValue(true);
        service = TestBed.inject(EventService);

        // Handle constructor call
        tick();
        httpMock.expectOne(apiUrl).flush([]);

        // Now revoke permission
        permissionService.hasReadAccess!.mockReturnValue(false);

        // Try to refresh events
        service.refreshEvents();
        tick();

        // Verify NO new HTTP call was made
        httpMock.expectNone(apiUrl);

        // Verify error state
        service.error$.subscribe(error => {
            expect(error).toBe('Permissions insuffisantes');
        });
    }));

    it('should call API in loadEvents if user has permission', fakeAsync(() => {
        // Mock: User has permission
        permissionService.hasReadAccess!.mockReturnValue(true);
        service = TestBed.inject(EventService);

        // Handle constructor call
        tick();
        httpMock.expectOne(apiUrl).flush([]);

        // Refresh events (should work)
        service.refreshEvents();
        tick();

        // Verify HTTP call was made
        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    }));

    it('should log warning when permission check fails', fakeAsync(() => {
        // Spy on console.warn
        jest.spyOn(console, 'warn').mockImplementation();

        // Mock: User has NO permission
        permissionService.hasReadAccess!.mockReturnValue(false);

        service = TestBed.inject(EventService);

        tick();

        // Call refreshEvents to trigger the check inside loadEvents
        service.refreshEvents();
        tick();

        // Verify warning was logged
        expect(console.warn).toHaveBeenCalledWith(
            'EventService: No permission to load events (CALENDAR READ required)'
        );
    }));

    it('should check CALENDAR module for permission', fakeAsync(() => {
        permissionService.hasReadAccess!.mockReturnValue(true);
        service = TestBed.inject(EventService);

        tick();

        // Verify hasReadAccess was called with 'CALENDAR'
        expect(permissionService.hasReadAccess).toHaveBeenCalledWith('CALENDAR');

        // Clean up
        httpMock.expectOne(apiUrl).flush([]);
    }));
});
