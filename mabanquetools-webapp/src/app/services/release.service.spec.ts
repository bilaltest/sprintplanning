import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReleaseService } from './release.service';
import { PermissionService } from './permission.service';
import { environment } from '../../environments/environment';
import { Release, CreateReleaseDto, UpdateReleaseDto, CreateFeatureDto, CreateActionDto } from '@models/release.model';

describe('ReleaseService', () => {
    let service: ReleaseService;
    let httpMock: HttpTestingController;
    let permissionServiceMock: any;
    const apiUrl = `${environment.apiUrl}/releases`;

    const mockRelease: Release = {
        id: '1',
        slug: 'release-1',
        name: 'Release 1',
        releaseDate: '2025-01-01',
        status: 'draft',
        type: 'release',
        squads: []
    };

    beforeEach(fakeAsync(() => {
        permissionServiceMock = {
            hasReadAccess: jest.fn().mockReturnValue(true)
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ReleaseService,
                { provide: PermissionService, useValue: permissionServiceMock }
            ]
        });
        service = TestBed.inject(ReleaseService);
        httpMock = TestBed.inject(HttpTestingController);

        // Advance time to trigger setTimeout in constructor
        tick();

        // Handle initial loadReleases call from constructor
        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    }));

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load releases', async () => {
        const promise = service.loadReleases();
        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush([mockRelease]);

        await promise;
        service.releases$.subscribe(releases => {
            if (releases.length > 0) {
                expect(releases[0]).toEqual(mockRelease);
            }
        });
    });

    it('should get release', async () => {
        const promise = service.getRelease('1');
        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockRelease);

        await promise;
    });

    it('should create release', async () => {
        const dto: CreateReleaseDto = { name: 'Release 1', releaseDate: '2025-01-01', type: 'release' };
        const promise = service.createRelease(dto);

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('POST');
        req.flush(mockRelease);

        await new Promise(resolve => setTimeout(resolve, 0));

        // Reload releases
        const reqReload = httpMock.expectOne(apiUrl);
        reqReload.flush([mockRelease]);

        await promise;
    });

    it('should update release', async () => {
        const dto: UpdateReleaseDto = { status: 'in_progress' };
        const updatedRelease = { ...mockRelease, status: 'in_progress' as const };

        const promise = service.updateRelease('1', dto);

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush(updatedRelease);

        await new Promise(resolve => setTimeout(resolve, 0));

        // Reload releases
        const reqReload = httpMock.expectOne(apiUrl);
        reqReload.flush([updatedRelease]);

        await promise;
    });

    it('should delete release', async () => {
        const promise = service.deleteRelease('1');

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        await new Promise(resolve => setTimeout(resolve, 0));

        // Reload releases
        const reqReload = httpMock.expectOne(apiUrl);
        reqReload.flush([]);

        await promise;
    });

    it('should add feature', async () => {
        const dto: CreateFeatureDto = { title: 'Feature', description: 'Desc' };
        const promise = service.addFeature('squad1', dto);

        const req = httpMock.expectOne(`${apiUrl}/squads/squad1/features`);
        expect(req.request.method).toBe('POST');
        req.flush({ id: 'feat1', ...dto });

        await promise;
    });

    it('should update feature', async () => {
        const dto: CreateFeatureDto = { title: 'Updated', description: 'Desc' };
        const promise = service.updateFeature('feat1', dto);

        const req = httpMock.expectOne(`${apiUrl}/features/feat1`);
        expect(req.request.method).toBe('PUT');
        req.flush({ id: 'feat1', ...dto });

        await promise;
    });

    it('should delete feature', async () => {
        const promise = service.deleteFeature('feat1');

        const req = httpMock.expectOne(`${apiUrl}/features/feat1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        await promise;
    });

    it('should add action', async () => {
        const dto: CreateActionDto = { title: 'Action', description: 'Desc', type: 'other', phase: 'pre_mep' };
        const promise = service.addAction('squad1', dto);

        const req = httpMock.expectOne(`${apiUrl}/squads/squad1/actions`);
        expect(req.request.method).toBe('POST');
        req.flush({ id: 'act1', ...dto });

        await promise;
    });

    it('should update action', async () => {
        const dto: Partial<CreateActionDto> = { title: 'Updated' };
        const promise = service.updateAction('act1', dto);

        const req = httpMock.expectOne(`${apiUrl}/actions/act1`);
        expect(req.request.method).toBe('PUT');
        req.flush({ id: 'act1', title: 'Updated' });

        await promise;
    });

    it('should delete action', async () => {
        const promise = service.deleteAction('act1');

        const req = httpMock.expectOne(`${apiUrl}/actions/act1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        await promise;
    });

    it('should toggle action status', async () => {
        const promise = service.toggleActionStatus('act1', 'pending');

        const req = httpMock.expectOne(`${apiUrl}/actions/act1`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({ status: 'completed' });
        req.flush({ id: 'act1', status: 'completed' });

        await promise;
    });

    it('should handle API requests correctly', async () => {
        const releaseId = '1';
        const getPromise = service.getRelease(releaseId);

        const req = httpMock.expectOne(`${apiUrl}/${releaseId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockRelease);

        const result = await getPromise;
        expect(result).toEqual(mockRelease);
    });
});
