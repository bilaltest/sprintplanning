import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationModalComponent } from './confirmation-modal.component';
import { ConfirmationService } from '@services/confirmation.service';
import { BehaviorSubject } from 'rxjs';
import { ConfirmationOptions } from '@models/confirmation.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ConfirmationModalComponent', () => {
    let component: ConfirmationModalComponent;
    let fixture: ComponentFixture<ConfirmationModalComponent>;
    let confirmationService: any;
    let confirmationSubject: BehaviorSubject<ConfirmationOptions | null>;

    beforeEach(async () => {
        confirmationSubject = new BehaviorSubject<ConfirmationOptions | null>(null);
        confirmationService = {
            confirmation$: confirmationSubject.asObservable(),
            respond: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [ConfirmationModalComponent, NoopAnimationsModule],
            providers: [
                { provide: ConfirmationService, useValue: confirmationService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmationModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display modal when confirmation options are present', () => {
        const options: ConfirmationOptions = {
            title: 'Test Title',
            message: 'Test Message',
            confirmText: 'Yes',
            cancelText: 'No'
        };
        confirmationSubject.next(options);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('h3')?.textContent).toContain('Test Title');
        expect(compiled.querySelector('p')?.textContent).toContain('Test Message');
    });

    it('should not display modal when no options', () => {
        confirmationSubject.next(null);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.fixed')).toBeFalsy();
    });

    it('should confirm', () => {
        const options: ConfirmationOptions = { title: 'Test', message: 'Test' };
        confirmationSubject.next(options);
        fixture.detectChanges();

        component.confirm();
        expect(confirmationService.respond).toHaveBeenCalledWith(true);
    });

    it('should cancel', () => {
        const options: ConfirmationOptions = { title: 'Test', message: 'Test' };
        confirmationSubject.next(options);
        fixture.detectChanges();

        component.cancel();
        expect(confirmationService.respond).toHaveBeenCalledWith(false);
    });

    it('should return correct icon', () => {
        expect(component.getIcon('danger')).toBe('warning');
        expect(component.getIcon('warning')).toBe('error_outline');
        expect(component.getIcon('primary')).toBe('help_outline');
        expect(component.getIcon(undefined)).toBe('help_outline');
    });
});
