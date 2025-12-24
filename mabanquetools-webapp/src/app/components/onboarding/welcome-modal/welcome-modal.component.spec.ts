import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeModalComponent } from './welcome-modal.component';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('WelcomeModalComponent', () => {
    let component: WelcomeModalComponent;
    let fixture: ComponentFixture<WelcomeModalComponent>;
    let dialogRefSpy: jest.Mocked<MatDialogRef<WelcomeModalComponent>>;

    beforeEach(async () => {
        const spy = {
            close: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [WelcomeModalComponent, NoopAnimationsModule],
            providers: [
                { provide: MatDialogRef, useValue: spy }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(WelcomeModalComponent);
        component = fixture.componentInstance;
        dialogRefSpy = TestBed.inject(MatDialogRef) as jest.Mocked<MatDialogRef<WelcomeModalComponent>>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close dialog when close is called', () => {
        component.close();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
