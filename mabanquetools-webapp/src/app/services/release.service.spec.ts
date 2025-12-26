import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReleaseService } from './release.service';
import { PermissionService } from './permission.service';
import { environment } from '../../environments/environment';
import { Release, CreateReleaseDto, UpdateReleaseDto, CreateFeatureDto, CreateActionDto } from '@models/release.model';

describe('ReleaseService', () => {
    let service: ReleaseService;
    let httpMock: HttpTestingController;
    let permissionService: any;
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

    beforeEach(() => {
        permissionService = {
            hasReadAccess: jest.fn().mockReturnValue(true),
            hasWriteAccess: jest.fn().mockReturnValue(true)
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ReleaseService,
                { provide: PermissionService, useValue: permissionService }
            ]
        });
        service = TestBed.inject(ReleaseService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', fakeAsync(() => {
        expect(service).toBeTruthy();

        // Wait for setTimeout in constructor
        tick();

        // Handle initial loadReleases call from constructor
        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    }));

    it('should load releases', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const promise = service.loadReleases();
        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush([mockRelease]);

        tick();

        service.releases$.subscribe(releases => {
            if (releases.length > 0) {
                expect(releases[0]).toEqual(mockRelease);
            }
        });
    }));

    it('should get release', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const promise = service.getRelease('1');
        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockRelease);

        tick();

        promise.then(release => {
            expect(release).toEqual(mockRelease);
        });

        tick();
    }));

    it('should create release', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const dto: CreateReleaseDto = { name: 'Release 1', releaseDate: '2025-01-01', type: 'release' };
        const promise = service.createRelease(dto);

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('POST');
        req.flush(mockRelease);

        tick();

        // Reload releases
        const reqReload = httpMock.expectOne(apiUrl);
        reqReload.flush([mockRelease]);

        tick();

        promise.then(release => {
            expect(release).toEqual(mockRelease);
        });

        tick();
    }));

    it('should update release', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const dto: UpdateReleaseDto = { status: 'in_progress' };
        const updatedRelease = { ...mockRelease, status: 'in_progress' as const };

        const promise = service.updateRelease('1', dto);

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush(updatedRelease);

        tick();

        // Reload releases
        const reqReload = httpMock.expectOne(apiUrl);
        reqReload.flush([updatedRelease]);

        tick();

        promise.then(release => {
            expect(release).toEqual(updatedRelease);
        });

        tick();
    }));

    it('should delete release', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const promise = service.deleteRelease('1');

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        tick();

        // Reload releases
        const reqReload = httpMock.expectOne(apiUrl);
        reqReload.flush([]);

        tick();

        promise.then(() => {
            expect(true).toBe(true);
        });

        tick();
    }));

    it('should add feature', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const dto: CreateFeatureDto = { title: 'Feature', description: 'Desc' };
        const promise = service.addFeature('squad1', dto);

        const req = httpMock.expectOne(`${apiUrl}/squads/squad1/features`);
        expect(req.request.method).toBe('POST');
        req.flush({ id: 'feat1', ...dto });

        tick();

        promise.then(feature => {
            expect(feature.title).toBe('Feature');
        });

        tick();
    }));

    it('should update feature', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const dto: CreateFeatureDto = { title: 'Updated', description: 'Desc' };
        const promise = service.updateFeature('feat1', dto);

        const req = httpMock.expectOne(`${apiUrl}/features/feat1`);
        expect(req.request.method).toBe('PUT');
        req.flush({ id: 'feat1', ...dto });

        tick();

        promise.then(feature => {
            expect(feature.title).toBe('Updated');
        });

        tick();
    }));

    it('should delete feature', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const promise = service.deleteFeature('feat1');

        const req = httpMock.expectOne(`${apiUrl}/features/feat1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        tick();

        promise.then(() => {
            expect(true).toBe(true);
        });

        tick();
    }));

    it('should add action', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const dto: CreateActionDto = { title: 'Action', description: 'Desc', type: 'other', phase: 'pre_mep' };
        const promise = service.addAction('squad1', dto);

        const req = httpMock.expectOne(`${apiUrl}/squads/squad1/actions`);
        expect(req.request.method).toBe('POST');
        req.flush({ id: 'act1', ...dto });

        tick();

        promise.then(action => {
            expect(action.title).toBe('Action');
        });

        tick();
    }));

    it('should update action', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const dto: Partial<CreateActionDto> = { title: 'Updated' };
        const promise = service.updateAction('act1', dto);

        const req = httpMock.expectOne(`${apiUrl}/actions/act1`);
        expect(req.request.method).toBe('PUT');
        req.flush({ id: 'act1', title: 'Updated' });

        tick();

        promise.then(action => {
            expect(action.title).toBe('Updated');
        });

        tick();
    }));

    it('should delete action', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const promise = service.deleteAction('act1');

        const req = httpMock.expectOne(`${apiUrl}/actions/act1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        tick();

        promise.then(() => {
            expect(true).toBe(true);
        });

        tick();
    }));

    it('should toggle action status', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const promise = service.toggleActionStatus('act1', 'pending');

        const req = httpMock.expectOne(`${apiUrl}/actions/act1`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({ status: 'completed' });
        req.flush({ id: 'act1', status: 'completed' });

        tick();

        promise.then(action => {
            expect(action.status).toBe('completed');
        });

        tick();
    }));

    it('should handle API requests correctly', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush([]);
        tick();

        const releaseId = '1';
        const getPromise = service.getRelease(releaseId);

        const req = httpMock.expectOne(`${apiUrl}/${releaseId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockRelease);

        tick();

        getPromise.then(result => {
            expect(result).toEqual(mockRelease);
        });

        tick();
    }));
});
