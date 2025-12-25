import { TestBed } from '@angular/core/testing';
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

    it('should NOT load releases on init if user has no RELEASES permission', (done) => {
        // Mock: User has NO permission
        permissionService.hasReadAccess!.mockReturnValue(false);

        // Create service (will trigger constructor)
        service = TestBed.inject(ReleaseService);

        // Wait for setTimeout to execute
        setTimeout(() => {
            // Verify NO HTTP call was made
            httpMock.expectNone(apiUrl);

            // Verify error state is set
            service.error$.subscribe(error => {
                expect(error).toBe('Permissions insuffisantes');
                done();
            });
        }, 10);
    });

    it('should load releases on init if user has RELEASES READ permission', (done) => {
        // Mock: User has READ permission
        permissionService.hasReadAccess!.mockReturnValue(true);

        // Create service (will trigger constructor)
        service = TestBed.inject(ReleaseService);

        // Wait for setTimeout to execute
        setTimeout(() => {
            // Verify HTTP call was made
            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('GET');
            req.flush([]);

            done();
        }, 10);
    });

    it('should NOT call API in loadReleases if user has no permission', async () => {
        // Mock: User has permission initially (for constructor)
        permissionService.hasReadAccess!.mockReturnValue(true);
        service = TestBed.inject(ReleaseService);

        // Handle constructor call
        setTimeout(() => {
            const req = httpMock.match(apiUrl);
            req.forEach(r => r.flush([]));
        }, 10);

        await new Promise(resolve => setTimeout(resolve, 20));

        // Now revoke permission
        permissionService.hasReadAccess!.mockReturnValue(false);

        // Try to refresh releases
        await service.refreshReleases();

        // Verify NO new HTTP call was made
        httpMock.expectNone(apiUrl);

        // Verify error state
        service.error$.subscribe(error => {
            expect(error).toBe('Permissions insuffisantes');
        });
    });

    it('should call API in loadReleases if user has permission', async () => {
        // Mock: User has permission
        permissionService.hasReadAccess!.mockReturnValue(true);
        service = TestBed.inject(ReleaseService);

        // Handle constructor call
        setTimeout(() => {
            const req = httpMock.match(apiUrl);
            req.forEach(r => r.flush([]));
        }, 10);

        await new Promise(resolve => setTimeout(resolve, 20));

        // Refresh releases (should work)
        const refreshPromise = service.refreshReleases();

        // Verify HTTP call was made
        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush([]);

        await refreshPromise;
    });

    it('should log warning when permission check fails', (done) => {
        // Spy on console.warn
        jest.spyOn(console, 'warn').mockImplementation();

        // Mock: User has NO permission
        permissionService.hasReadAccess!.mockReturnValue(false);

        service = TestBed.inject(ReleaseService);

        setTimeout(() => {
            // Verify warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                'ReleaseService: No permission to load releases (RELEASES READ required)'
            );
            done();
        }, 10);
    });

    it('should check RELEASES module for permission', (done) => {
        permissionService.hasReadAccess!.mockReturnValue(true);
        service = TestBed.inject(ReleaseService);

        setTimeout(() => {
            // Verify hasReadAccess was called with 'RELEASES'
            expect(permissionService.hasReadAccess).toHaveBeenCalledWith('RELEASES');

            // Clean up
            const req = httpMock.match(apiUrl);
            req.forEach(r => r.flush([]));
            done();
        }, 10);
    });

    it('should NOT load current release if user loses permission', async () => {
        // Mock: User has permission initially
        permissionService.hasReadAccess!.mockReturnValue(true);
        service = TestBed.inject(ReleaseService);

        // Handle constructor call
        setTimeout(() => {
            const req = httpMock.match(apiUrl);
            req.forEach(r => r.flush([{ id: 'rel1', name: 'Release 1', squads: [] }]));
        }, 10);

        await new Promise(resolve => setTimeout(resolve, 20));

        // Get a specific release
        const getReleasePromise = service.getRelease('rel1');
        const getReq = httpMock.expectOne(`${apiUrl}/rel1`);
        getReq.flush({ id: 'rel1', name: 'Release 1', squads: [] });
        await getReleasePromise;

        // Revoke permission
        permissionService.hasReadAccess!.mockReturnValue(false);

        // Try to refresh
        await service.refreshReleases();

        // Should not call getRelease API even though currentRelease is set
        httpMock.expectNone(`${apiUrl}/rel1`);
    });
});
