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
        component.password = '';
        await component.onSubmit();
        expect(authService.login).not.toHaveBeenCalled();
    });

    it('should login successfully', async () => {
        jest.useFakeTimers();
        component.email = 'test@example.com';
        component.password = 'password';
        authService.login.mockResolvedValue({ success: true });

        const promise = component.onSubmit();

        // Initial state
        expect(component.isLoading).toBe(true);
        expect(component.showError).toBe(false);

        // Advance time to trigger timeout
        jest.advanceTimersByTime(500);

        await promise;

        expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
        expect(component.isLoading).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/']);

        jest.useRealTimers();
    });

    it('should handle login failure', async () => {
        jest.useFakeTimers();
        component.email = 'test@example.com';
        component.password = 'wrong';
        authService.login.mockResolvedValue({ success: false, message: 'Invalid credentials' });

        const promise = component.onSubmit();

        // Advance time to trigger timeout
        jest.advanceTimersByTime(500);

        await promise;

        expect(authService.login).toHaveBeenCalledWith('test@example.com', 'wrong');
        expect(component.isLoading).toBe(false);
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.showError).toBe(true);
        expect(component.errorMessage).toBe('Invalid credentials');
        expect(component.password).toBe('');

        jest.useRealTimers();
    });
});
