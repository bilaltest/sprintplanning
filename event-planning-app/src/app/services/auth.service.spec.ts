import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    const STORAGE_KEY = 'planning_auth_token';

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthService);
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
});
