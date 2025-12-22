import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AbsenceService } from './absence.service';
import { environment } from '../../environments/environment';
import { CreateAbsenceRequest } from '../models/absence.model';

describe('AbsenceService', () => {
    let service: AbsenceService;
    let httpMock: HttpTestingController;
    const apiUrl = `${environment.apiUrl}/absences`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AbsenceService]
        });
        service = TestBed.inject(AbsenceService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get absences', () => {
        const mockAbsences = [{ id: '1' }] as any;
        service.getAbsences().subscribe(absences => {
            expect(absences).toEqual(mockAbsences);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockAbsences);
    });

    it('should get absences with dates', () => {
        service.getAbsences('2025-01-01', '2025-01-31').subscribe();

        const req = httpMock.expectOne(r => r.url === apiUrl && r.params.has('startDate') && r.params.has('endDate'));
        expect(req.request.method).toBe('GET');
        expect(req.request.params.get('startDate')).toBe('2025-01-01');
        expect(req.request.params.get('endDate')).toBe('2025-01-31');
        req.flush([]);
    });

    it('should get absence users', () => {
        const mockUsers = [{ id: '1' }] as any;
        service.getAbsenceUsers().subscribe(users => {
            expect(users).toEqual(mockUsers);
        });

        const req = httpMock.expectOne(`${apiUrl}/users`);
        expect(req.request.method).toBe('GET');
        req.flush(mockUsers);
    });

    it('should create absence', () => {
        const request: CreateAbsenceRequest = { type: 'RTT', startDate: '2025-01-01', endDate: '2025-01-02' } as any;
        const mockAbsence = { id: '1', ...request } as any;

        service.createAbsence(request).subscribe(absence => {
            expect(absence).toEqual(mockAbsence);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(request);
        req.flush(mockAbsence);
    });

    it('should update absence', () => {
        const request: CreateAbsenceRequest = { type: 'CP' } as any;
        const mockAbsence = { id: '1', type: 'CP' } as any;

        service.updateAbsence('1', request).subscribe(absence => {
            expect(absence).toEqual(mockAbsence);
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(request);
        req.flush(mockAbsence);
    });

    it('should delete absence', () => {
        service.deleteAbsence('1').subscribe();

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
    });
});
