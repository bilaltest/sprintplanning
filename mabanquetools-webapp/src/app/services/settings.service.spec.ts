import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SettingsService } from './settings.service';
import { AuthService } from './auth.service';
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
        const authServiceMock = {
            updatePreferences: jest.fn().mockResolvedValue({}),
            getCurrentUser: jest.fn().mockReturnValue({ themePreference: 'light' })
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                SettingsService,
                { provide: AuthService, useValue: authServiceMock }
            ]
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
        await service.setTheme(newTheme);

        // Verify AuthService was called
        expect((service as any).authService.updatePreferences).toHaveBeenCalledWith(newTheme);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should reset to defaults', async () => {
        const promise = service.resetToDefaults();

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('PUT');
        req.flush({ ...DEFAULT_PREFERENCES, id: '1' });

        await promise;

        // Verify theme reset
        expect((service as any).authService.updatePreferences).toHaveBeenCalledWith('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should update preferences', async () => {
        const newPrefs = { ...mockPreferences, theme: 'dark' as const };
        const promise = service.updatePreferences(newPrefs);

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(newPrefs);

        await promise;
    });

    it('should toggle theme', async () => {
        // Initial state is light (mocked in AuthService.getCurrentUser)

        // Toggle to dark
        await service.toggleTheme();
        expect((service as any).authService.updatePreferences).toHaveBeenCalledWith('dark');

        // Update mock to return dark for next call
        (service as any).authService.getCurrentUser.mockReturnValue({ themePreference: 'dark' });

        // Toggle back to light
        await service.toggleTheme();
        expect((service as any).authService.updatePreferences).toHaveBeenCalledWith('light');
    });
});
