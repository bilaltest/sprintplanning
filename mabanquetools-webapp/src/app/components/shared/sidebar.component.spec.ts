import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '@services/auth.service';
import { SidebarService } from '@services/sidebar.service';
import { PermissionService } from '@services/permission.service';
import { ToastService } from '@services/toast.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let authServiceMock: any;
    let sidebarServiceMock: any;
    let permissionServiceMock: any;
    let toastServiceMock: any;

    let currentUserSubject: BehaviorSubject<any>;

    beforeEach(async () => {
        currentUserSubject = new BehaviorSubject<any>(null);

        authServiceMock = {
            currentUser$: currentUserSubject.asObservable(),
            logout: jest.fn(),
            changePassword: jest.fn()
        };

        sidebarServiceMock = {
            collapsed$: of(false),
            mobileMenuOpen$: of(false),
            toggle: jest.fn(),
            openMobileMenu: jest.fn(),
            closeMobileMenu: jest.fn()
        };

        permissionServiceMock = {
            hasReadAccess: jest.fn().mockReturnValue(true)
        };

        toastServiceMock = {
            success: jest.fn(),
            error: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [SidebarComponent, RouterTestingModule],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: SidebarService, useValue: sidebarServiceMock },
                { provide: PermissionService, useValue: permissionServiceMock },
                { provide: ToastService, useValue: toastServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show password button for normal user', () => {
        const normalUser = {
            id: '1',
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean@test.com',
            cannotChangePassword: false
        };
        currentUserSubject.next(normalUser);
        fixture.detectChanges();

        const buttons = fixture.debugElement.queryAll(By.css('button'));
        const passwordButton = buttons.find(btn => btn.nativeElement.textContent.includes('Mot de passe'));

        expect(passwordButton).toBeTruthy();
    });

    it('should hide password button for guest user (cannotChangePassword = true)', () => {
        const guestUser = {
            id: 'guest',
            firstName: 'Invité',
            lastName: 'Invité',
            email: 'invite',
            cannotChangePassword: true
        };
        currentUserSubject.next(guestUser);
        fixture.detectChanges();

        const buttons = fixture.debugElement.queryAll(By.css('button'));
        const passwordButton = buttons.find(btn => btn.nativeElement.textContent.includes('Mot de passe'));

        expect(passwordButton).toBeFalsy();
    });
});
