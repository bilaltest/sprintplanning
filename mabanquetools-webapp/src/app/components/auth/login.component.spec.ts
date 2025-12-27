import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '@services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, BehaviorSubject } from 'rxjs';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authService: any;
    let router: any;

    beforeEach(async () => {
        authService = {
            login: jest.fn()
        };

        router = {
            navigate: jest.fn(),
            createUrlTree: jest.fn(),
            serializeUrl: jest.fn(),
            events: new BehaviorSubject(null)
        };

        await TestBed.configureTestingModule({
            imports: [LoginComponent, FormsModule],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: Router, useValue: router },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of({})
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not submit if password is empty', async () => {
        component.emailPrefix = 'test';
        component.password = '';
        await component.onSubmit();
        expect(authService.login).not.toHaveBeenCalled();
    });

    it('should login successfully with suffix appended', async () => {
        component.emailPrefix = 'test';
        component.password = 'password';
        authService.login.mockResolvedValue({ success: true });

        await component.onSubmit();

        expect(authService.login).toHaveBeenCalledWith('test@ca-ts.fr', 'password');
        expect(component.isLoading).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle login failure', async () => {
        component.emailPrefix = 'test';
        component.password = 'wrong';
        authService.login.mockResolvedValue({ success: false, message: 'Invalid credentials' });

        await component.onSubmit();

        expect(authService.login).toHaveBeenCalledWith('test@ca-ts.fr', 'wrong');
        expect(component.isLoading).toBe(false);
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.showError).toBe(true);
        expect(component.errorMessage).toBe('Invalid credentials');
        expect(component.password).toBe('');
    });

    describe('loginAsGuest', () => {
        it('should login as guest successfully', async () => {
            authService.login.mockResolvedValue({ success: true });

            await component.loginAsGuest();

            expect(component.isLoading).toBe(false);
            expect(authService.login).toHaveBeenCalledWith('invite', 'invite');
            expect(router.navigate).toHaveBeenCalledWith(['/']);
            expect(component.showError).toBe(false);
        });

        it('should handle guest login failure', async () => {
            authService.login.mockResolvedValue({ success: false, message: 'Login failed' });

            await component.loginAsGuest();

            expect(component.isLoading).toBe(false);
            expect(authService.login).toHaveBeenCalledWith('invite', 'invite');
            expect(router.navigate).not.toHaveBeenCalled();
            expect(component.showError).toBe(true);
            expect(component.errorMessage).toBe('Login failed');
        });
    });

});
