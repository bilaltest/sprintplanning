import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService } from '@services/toast.service';
import { BehaviorSubject } from 'rxjs';
import { Toast } from '@models/toast.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ToastContainerComponent', () => {
    let component: ToastContainerComponent;
    let fixture: ComponentFixture<ToastContainerComponent>;
    let toastService: any;
    let toastsSubject: BehaviorSubject<Toast[]>;

    beforeEach(async () => {
        toastsSubject = new BehaviorSubject<Toast[]>([]);
        toastService = {
            toasts$: toastsSubject.asObservable(),
            dismiss: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [ToastContainerComponent, NoopAnimationsModule],
            providers: [
                { provide: ToastService, useValue: toastService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ToastContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display toasts', () => {
        const toasts: Toast[] = [
            { id: '1', type: 'success', title: 'Success', message: 'Message' },
            { id: '2', type: 'error', title: 'Error', message: 'Message' }
        ];
        toastsSubject.next(toasts);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelectorAll('.min-w-\\[320px\\]').length).toBe(2);
    });

    it('should close toast', () => {
        const toasts: Toast[] = [{ id: '1', type: 'success', title: 'Success' }];
        toastsSubject.next(toasts);
        fixture.detectChanges();

        component.close('1');
        expect(toastService.dismiss).toHaveBeenCalledWith('1');
    });

    it('should handle action', () => {
        const handler = jest.fn();
        const toast: Toast = {
            id: '1',
            type: 'info',
            title: 'Info',
            action: { label: 'Action', handler }
        };

        component.handleAction(toast);

        expect(handler).toHaveBeenCalled();
        expect(toastService.dismiss).toHaveBeenCalledWith('1');
    });

    it('should return correct icon', () => {
        expect(component.getIcon('success')).toBe('check_circle');
        expect(component.getIcon('error')).toBe('error');
        expect(component.getIcon('warning')).toBe('warning');
        expect(component.getIcon('info')).toBe('info');
        expect(component.getIcon('unknown')).toBe('info');
    });
});
