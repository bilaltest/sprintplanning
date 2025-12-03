import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { Router } from '@angular/router';
import { SettingsService } from '@services/settings.service';
import { BehaviorSubject } from 'rxjs';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;
    let router: any;
    let settingsService: any;

    beforeEach(async () => {
        router = {
            navigate: jest.fn()
        };

        settingsService = {
            preferences$: new BehaviorSubject({ theme: 'light' }),
            toggleTheme: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [HomeComponent],
            providers: [
                { provide: Router, useValue: router },
                { provide: SettingsService, useValue: settingsService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to planning', () => {
        component.navigateToPlanning();
        expect(router.navigate).toHaveBeenCalledWith(['/planning']);
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
