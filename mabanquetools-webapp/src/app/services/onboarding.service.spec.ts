import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OnboardingService } from './onboarding.service';
import { environment } from '../../environments/environment';

describe('OnboardingService', () => {
    let service: OnboardingService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [OnboardingService]
        });
        service = TestBed.inject(OnboardingService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load seen keys', () => {
        const dummyKeys = ['WELCOME', 'FEATURE_CALENDAR'];

        service.loadSeenKeys().subscribe(keys => {
            expect(keys.length).toBe(2);
            expect(keys).toEqual(dummyKeys);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/onboarding/status`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyKeys);

        // After loading, shouldShow should work correctly
        expect(service.shouldShow('WELCOME')).toBe(false);
        expect(service.shouldShow('FEATURE_ABSENCE')).toBe(true);
    });

    it('should mark key as seen', () => {
        const key = 'FEATURE_NEW';
        // Initially not seen (assuming loaded or assuming behavior with optimistic update)
        // We must load first to set 'loaded' flag for shouldShow to work reliably?
        // In current implementation, shouldShow returns false if not loaded.

        // Simulate load first
        service.loadSeenKeys().subscribe();
        const reqLoad = httpMock.expectOne(`${environment.apiUrl}/onboarding/status`);
        reqLoad.flush([]);

        expect(service.shouldShow(key)).toBe(true);

        service.markAsSeen(key);

        // Optimistically updated
        expect(service.shouldShow(key)).toBe(false);

        const reqPost = httpMock.expectOne(`${environment.apiUrl}/onboarding/seen/${key}`);
        expect(reqPost.request.method).toBe('POST');
        reqPost.flush({});
    });
});
