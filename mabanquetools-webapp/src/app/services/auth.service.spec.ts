import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    const STORAGE_KEY = 'planning_auth_token';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
        sessionStorage.clear();
    });

    afterEach(() => {
        sessionStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should check if user is authenticated', () => {
        expect(service.isAuthenticated()).toBe(false);

        sessionStorage.setItem(STORAGE_KEY, 'token');
        service['isAuthenticatedSubject'].next(true);

        expect(service.isAuthenticated()).toBe(true);
    });

    it('should logout', () => {
        sessionStorage.setItem(STORAGE_KEY, 'token');
        service['isAuthenticatedSubject'].next(true);

        service.logout();

        expect(service.isAuthenticated()).toBe(false);
        expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should get token', () => {
        sessionStorage.setItem(STORAGE_KEY, 'test-token');
        expect(service.getToken()).toBe('test-token');
    });

    it('should return null token if not authenticated', () => {
        expect(service.getToken()).toBeNull();
    });
    it('should register user', async () => {
        const mockResponse = { message: 'Success', user: { id: '1', email: 'test@test.com' } as any };
        const promise = service.register('test@test.com', 'password');

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);

        const result = await promise;
        expect(result.success).toBe(true);
    });

    it('should login user', async () => {
        const mockUser = { id: '1', email: 'test@test.com', themePreference: 'light' } as any;
        const mockResponse = { message: 'Success', token: 'token123', user: mockUser };

        const promise = service.login('test@test.com', 'password');

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);

        const result = await promise;
        expect(result.success).toBe(true);
        expect(service.getToken()).toBe('token123');
        expect(service.getCurrentUser()).toEqual(mockUser);
        expect(service.isAuthenticated()).toBe(true);
    });

    it('should fetch current user', async () => {
        sessionStorage.setItem(STORAGE_KEY, 'token123');
        const mockUser = { id: '1', email: 'test@test.com' } as any;

        const promise = service.fetchCurrentUser();

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.get('Authorization')).toBe('Bearer token123');
        req.flush({ user: mockUser });

        const result = await promise;
        expect(result).toEqual(mockUser);
        expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should update preferences', async () => {
        sessionStorage.setItem(STORAGE_KEY, 'token123');
        const mockUser = { id: '1', themePreference: 'dark' } as any;

        const promise = service.updatePreferences('dark');

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/preferences`);
        expect(req.request.method).toBe('PUT');
        req.flush({ user: mockUser, message: 'Updated' });

        const result = await promise;
        expect(result).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should update widget order', async () => {
        sessionStorage.setItem(STORAGE_KEY, 'token123');
        const widgets = ['w1', 'w2'];
        const mockUser = { id: '1', widgetOrder: JSON.stringify(widgets) } as any;

        const promise = service.updateWidgetOrder(widgets);

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/widget-order`);
        expect(req.request.method).toBe('PUT');
        req.flush({ user: mockUser, message: 'Updated' });

        const result = await promise;
        expect(result).toBe(true);
        expect(service.getWidgetOrder()).toEqual(widgets);
    });

    it('should change password', async () => {
        sessionStorage.setItem(STORAGE_KEY, 'token123');

        const promise = service.changePassword('newpass');

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/change-password`);
        expect(req.request.method).toBe('POST');
        req.flush({});

        const result = await promise;
        expect(result.success).toBe(true);
    });

    it('should get user display name', () => {
        const user = { firstName: 'John', lastName: 'Doe' } as any;
        expect(service.getUserDisplayName(user)).toBe('John D.');
        expect(service.getUserDisplayName(null)).toBe('Utilisateur');
    });
