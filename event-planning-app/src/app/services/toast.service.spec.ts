import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
    let service: ToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ToastService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should show success toast', () => {
        service.success('Title', 'Message');
        service.toasts$.subscribe(toasts => {
            if (toasts.length > 0) {
                expect(toasts[0].type).toBe('success');
                expect(toasts[0].title).toBe('Title');
                expect(toasts[0].message).toBe('Message');
            }
        });
    });

    it('should show error toast', () => {
        service.error('Title');
        service.toasts$.subscribe(toasts => {
            if (toasts.length > 0) {
                expect(toasts[0].type).toBe('error');
            }
        });
    });

    it('should show warning toast', () => {
        service.warning('Title');
        service.toasts$.subscribe(toasts => {
            if (toasts.length > 0) {
                expect(toasts[0].type).toBe('warning');
            }
        });
    });

    it('should show info toast', () => {
        service.info('Title');
        service.toasts$.subscribe(toasts => {
            if (toasts.length > 0) {
                expect(toasts[0].type).toBe('info');
            }
        });
    });

    it('should dismiss toast', () => {
        const id = service.success('Title');
        service.dismiss(id);
        service.toasts$.subscribe(toasts => {
            expect(toasts.length).toBe(0);
        });
    });

    it('should dismiss all toasts', () => {
        service.success('Title 1');
        service.success('Title 2');
        service.dismissAll();
        service.toasts$.subscribe(toasts => {
            expect(toasts.length).toBe(0);
        });
    });

    it('should auto dismiss toast', fakeAsync(() => {
        service.success('Title', 'Message', 1000);

        tick(1000);

        service.toasts$.subscribe(toasts => {
            expect(toasts.length).toBe(0);
        });
    }));
});
