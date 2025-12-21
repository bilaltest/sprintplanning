import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { Router } from '@angular/router';
import { SettingsService } from '@services/settings.service';
import { EventService } from '@services/event.service';
import { ReleaseService } from '@services/release.service';
import { AuthService } from '@services/auth.service';
import { AbsenceService } from '@services/absence.service';
import { BehaviorSubject, of } from 'rxjs';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;
    let router: any;
    let settingsService: any;
    let eventService: any;
    let releaseService: any;
    let authService: any;
    let absenceService: any;

    beforeEach(async () => {
        router = {
            navigate: jest.fn()
        };

        settingsService = {
            preferences$: new BehaviorSubject({ theme: 'light' }),
            toggleTheme: jest.fn()
        };

        eventService = {
            events$: new BehaviorSubject([])
        };

        releaseService = {
            releases$: new BehaviorSubject([])
        };

        authService = {
            getWidgetOrder: jest.fn().mockReturnValue([]),
            updateWidgetOrder: jest.fn(),
            getCurrentUser: jest.fn().mockReturnValue({ id: '123', firstName: 'John' })
        };

        absenceService = {
            getAbsences: jest.fn().mockReturnValue(of([]))
        };

        await TestBed.configureTestingModule({
            imports: [HomeComponent],
            providers: [
                { provide: Router, useValue: router },
                { provide: SettingsService, useValue: settingsService },
                { provide: EventService, useValue: eventService },
                { provide: ReleaseService, useValue: releaseService },
                { provide: AuthService, useValue: authService },
                { provide: AbsenceService, useValue: absenceService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to calendar', () => {
        component.navigateToCalendar();
        expect(router.navigate).toHaveBeenCalledWith(['/calendar']);
    });

    it('should navigate to releases', () => {
        component.navigateToReleases();
        expect(router.navigate).toHaveBeenCalledWith(['/releases']);
    });

    it('should toggle theme', () => {
        component.toggleTheme();
        expect(settingsService.toggleTheme).toHaveBeenCalled();
    });
});
