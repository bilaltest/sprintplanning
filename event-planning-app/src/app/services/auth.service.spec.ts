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

    it('should initialize authentication state from storage', () => {
        sessionStorage.setItem(STORAGE_KEY, 'token');
        // Re-create service to test initialization
        service = new AuthService();
        expect(service.isAuthenticated()).toBe(true);
    });

    it('should login successfully with correct password', async () => {
        const result = await service.login('NMB');
        expect(result).toBe(true);
        expect(service.isAuthenticated()).toBe(true);
        expect(sessionStorage.getItem(STORAGE_KEY)).toBeTruthy();
    });

    it('should fail login with incorrect password', async () => {
        const result = await service.login('wrong');
        expect(result).toBe(false);
        expect(service.isAuthenticated()).toBe(false);
        expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
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
