import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReleaseService } from './release.service';
import { PermissionService } from './permission.service';
import { environment } from '../../environments/environment';

describe('ReleaseService - Permission Checks', () => {
    let service: ReleaseService;
    let httpMock: HttpTestingController;
    let permissionService: jest.Mocked<Partial<PermissionService>>;
    const apiUrl = `${environment.apiUrl}/releases`;

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
                ReleaseService,
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

    it('should NOT load releases on init if user has no RELEASES permission', fakeAsync(() => {
        // Mock: User has NO permission
        permissionService.hasReadAccess!.mockReturnValue(false);

        // Create service (will trigger constructor)
        service = TestBed.inject(ReleaseService);

        // Wait for setTimeout to execute
        tick();

        // Verify NO HTTP call was made
        httpMock.expectNone(apiUrl);

        // Verify error state is null (silent fail)
        service.error$.subscribe(error => {
            expect(error).toBeNull();
        });
    }));

    it('should load releases on init if user has RELEASES READ permission', fakeAsync(() => {
        // Mock: User has READ permission
        permissionService.hasReadAccess!.mockReturnValue(true);

        // Create service (will trigger constructor)
        service = TestBed.inject(ReleaseService);

        // Wait for setTimeout to execute
        tick();

        // Verify HTTP call was made
        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    }));

    it('should NOT call API in loadReleases if user has no permission', fakeAsync(() => {
        // Mock: User has permission initially (for constructor)
        permissionService.hasReadAccess!.mockReturnValue(true);
        service = TestBed.inject(ReleaseService);

        // Handle constructor call
        tick();
        httpMock.expectOne(apiUrl).flush([]);

        // Now revoke permission
        permissionService.hasReadAccess!.mockReturnValue(false);

        // Try to refresh releases
        service.refreshReleases();
        tick();

        // Verify NO new HTTP call was made
        httpMock.expectNone(apiUrl);

        // Verify error state
        service.error$.subscribe(error => {
            expect(error).toBe('Permissions insuffisantes');
        });
    }));

    it('should call API in loadReleases if user has permission', fakeAsync(() => {
        // Mock: User has permission
        permissionService.hasReadAccess!.mockReturnValue(true);
        service = TestBed.inject(ReleaseService);

        // Handle constructor call
        tick();
        httpMock.expectOne(apiUrl).flush([]);

        // Refresh releases (should work)
        service.refreshReleases();
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

        service = TestBed.inject(ReleaseService);

        tick();

        // Call refreshReleases to trigger the check inside loadReleases
        service.refreshReleases();
        tick();

        // Verify warning was logged
        expect(console.warn).toHaveBeenCalledWith(
            'ReleaseService: No permission to load releases (RELEASES READ required)'
        );
    }));

    it('should check RELEASES module for permission', fakeAsync(() => {
        permissionService.hasReadAccess!.mockReturnValue(true);
        service = TestBed.inject(ReleaseService);

        tick();

        // Verify hasReadAccess was called with 'RELEASES'
        expect(permissionService.hasReadAccess).toHaveBeenCalledWith('RELEASES');

        // Clean up
        httpMock.expectOne(apiUrl).flush([]);
    }));

    it('should NOT load current release if user loses permission', fakeAsync(() => {
        // Mock: User has permission initially
        permissionService.hasReadAccess!.mockReturnValue(true);
        service = TestBed.inject(ReleaseService);

        // Handle constructor call
        tick();
        httpMock.expectOne(apiUrl).flush([{ id: 'rel1', name: 'Release 1', squads: [] }]);

        // Get a specific release
        const getReleasePromise = service.getRelease('rel1');
        const getReq = httpMock.expectOne(`${apiUrl}/rel1`);
        getReq.flush({ id: 'rel1', name: 'Release 1', squads: [] });

        tick();

        // Revoke permission
        permissionService.hasReadAccess!.mockReturnValue(false);

        // Try to refresh
        service.refreshReleases();
        tick();

        // Should not call getRelease API even though currentRelease is set
        httpMock.expectNone(`${apiUrl}/rel1`);
    }));
});
