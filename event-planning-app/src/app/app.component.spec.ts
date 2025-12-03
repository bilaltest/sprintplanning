import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from '@components/toast/toast-container.component';
import { ConfirmationModalComponent } from '@components/confirmation/confirmation-modal.component';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    template: ''
})
class MockToastContainerComponent { }

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    template: ''
})
class MockConfirmationModalComponent { }

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent, RouterOutlet],
        })
            .overrideComponent(AppComponent, {
                remove: { imports: [ToastContainerComponent, ConfirmationModalComponent] },
                add: { imports: [MockToastContainerComponent, MockConfirmationModalComponent] }
            })
            .compileComponents();

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should contain router-outlet', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });

    it('should contain toast container', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('app-toast-container')).toBeTruthy();
    });

    it('should contain confirmation modal', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('app-confirmation-modal')).toBeTruthy();
    });
});
