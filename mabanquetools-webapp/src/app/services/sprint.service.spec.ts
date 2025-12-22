import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SprintService } from './sprint.service';
import { environment } from '../../environments/environment';

describe('SprintService', () => {
    let service: SprintService;
    let httpMock: HttpTestingController;
    const apiUrl = `${environment.apiUrl}/sprints`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SprintService]
        });
        service = TestBed.inject(SprintService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all sprints', () => {
        const mockSprints = [{ id: '1', name: 'Sprint 1' }] as any;
        service.getAllSprints().subscribe(sprints => {
            expect(sprints).toEqual(mockSprints);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockSprints);
    });

    it('should create sprint', () => {
        const newSprint = { name: 'Sprint 1' } as any;
        const createdSprint = { id: '1', ...newSprint } as any;

        service.createSprint(newSprint).subscribe(sprint => {
            expect(sprint).toEqual(createdSprint);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newSprint);
        req.flush(createdSprint);
    });

    it('should update sprint', () => {
        const updates = { name: 'Sprint 1 Updated' } as any;
        const updatedSprint = { id: '1', ...updates } as any;

        service.updateSprint('1', updates).subscribe(sprint => {
            expect(sprint).toEqual(updatedSprint);
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updates);
        req.flush(updatedSprint);
    });

    it('should delete sprint', () => {
        service.deleteSprint('1').subscribe();

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
    });
});
