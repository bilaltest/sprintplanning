import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SettingsService } from './settings.service';
import { environment } from '../../environments/environment';
import { UserPreferences, DEFAULT_PREFERENCES } from '@models/settings.model';

describe('SettingsService', () => {
    let service: SettingsService;
    let httpMock: HttpTestingController;
    const apiUrl = `${environment.apiUrl}/settings`;

    const mockPreferences: UserPreferences = {
        ...DEFAULT_PREFERENCES,
        id: '1',
        theme: 'light'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SettingsService]
        });
        service = TestBed.inject(SettingsService);
        httpMock = TestBed.inject(HttpTestingController);

        // Handle initial load
        const req = httpMock.expectOne(apiUrl);
        req.flush(mockPreferences);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load preferences on init', () => {
        service.preferences$.subscribe(prefs => {
            expect(prefs).toEqual(mockPreferences);
        });
    });

    it('should use default preferences on error', () => {
        // Re-create service to trigger constructor again
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SettingsService]
        });
        service = TestBed.inject(SettingsService);
        httpMock = TestBed.inject(HttpTestingController);

        const req = httpMock.expectOne(apiUrl);
        req.error(new ErrorEvent('Network error'));

        service.preferences$.subscribe(prefs => {
            expect(prefs).toEqual(DEFAULT_PREFERENCES);
        });
    });

    it('should set theme', async () => {
        const newTheme = 'dark';
        const updatedPrefs = { ...mockPreferences, theme: newTheme };

        const promise = service.setTheme(newTheme);

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body.theme).toBe(newTheme);
        req.flush(updatedPrefs);

        await promise;
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should reset to defaults', async () => {
        const promise = service.resetToDefaults();

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('PUT');
        req.flush({ ...DEFAULT_PREFERENCES, id: '1' });

        await promise;
        expect(service.getCurrentPreferences().theme).toBe(DEFAULT_PREFERENCES.theme);
    });

    it('should update preferences', async () => {
        const newPrefs = { ...mockPreferences, theme: 'dark' as const };
        const promise = service.updatePreferences(newPrefs);

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(newPrefs);

        await promise;
        expect(service.getCurrentPreferences().theme).toBe('dark');
    });

    it('should toggle theme', async () => {
        // Initial state is light (from mockPreferences)

        // Toggle to dark
        const promise1 = Promise.resolve(service.toggleTheme());
        const req1 = httpMock.expectOne(apiUrl);
        expect(req1.request.body.theme).toBe('dark');
        req1.flush({ ...mockPreferences, theme: 'dark' });
        await promise1;

        // Toggle back to light
        const promise2 = Promise.resolve(service.toggleTheme());
        const req2 = httpMock.expectOne(apiUrl);
        expect(req2.request.body.theme).toBe('light');
        req2.flush({ ...mockPreferences, theme: 'light' });
        await promise2;
    });
});
