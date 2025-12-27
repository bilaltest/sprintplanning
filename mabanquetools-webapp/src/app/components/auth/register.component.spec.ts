import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '@services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, BehaviorSubject } from 'rxjs';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let authService: any;
    let router: any;

    beforeEach(async () => {
        authService = {
            register: jest.fn()
        };

        router = {
            navigate: jest.fn(),
            createUrlTree: jest.fn(),
            serializeUrl: jest.fn(),
            events: new BehaviorSubject(null)
        };

        await TestBed.configureTestingModule({
            imports: [RegisterComponent, FormsModule],
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

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should register successfully', async () => {
        jest.useFakeTimers();
        component.emailPrefix = 'test';
        component.password = 'password';
        authService.register.mockResolvedValue({ success: true, message: 'Success' });

        const promise = component.onSubmit();

        expect(component.isLoading).toBe(true);

        await promise;

        expect(authService.register).toHaveBeenCalledWith('test@ca-ts.fr', 'password');
        expect(component.isLoading).toBe(false);
        expect(component.successMessage).toContain('Success');

        // Check redirect delay
        jest.advanceTimersByTime(2000);
        expect(router.navigate).toHaveBeenCalledWith(['/login']);

        jest.useRealTimers();
    });

    it('should handle register failure', async () => {
        component.emailPrefix = 'test';
        component.password = 'password';
        authService.register.mockResolvedValue({ success: false, message: 'Error' });

        await component.onSubmit();

        expect(authService.register).toHaveBeenCalledWith('test@ca-ts.fr', 'password');
        expect(component.isLoading).toBe(false);
        expect(component.showError).toBe(true);
        expect(component.errorMessage).toBe('Error');
    });

    it('should validate inputs', async () => {
        component.emailPrefix = '';
        component.password = '';

        await component.onSubmit();

        expect(authService.register).not.toHaveBeenCalled();
        expect(component.showError).toBe(true);
        expect(component.errorMessage).toBe('Veuillez remplir tous les champs');
    });
});
