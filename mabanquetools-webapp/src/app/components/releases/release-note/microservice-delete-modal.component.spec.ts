import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MicroserviceDeleteModalComponent } from './microservice-delete-modal.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MicroserviceService } from '../../../services/microservice.service';
import { ToastService } from '../../../services/toast.service';
import { of, throwError } from 'rxjs';
import { Microservice } from '../../../models/microservice.model';

describe('MicroserviceDeleteModalComponent', () => {
    let component: MicroserviceDeleteModalComponent;
    let fixture: ComponentFixture<MicroserviceDeleteModalComponent>;
    let microserviceServiceSpy: any;
    let toastServiceSpy: any;
    let dialogRefSpy: any;

    const mockMicroservices: Microservice[] = [
        { id: '1', name: 'Service A', squad: 'Squad 1', solution: 'Sol A', isActive: true, displayOrder: 1 },
        { id: '2', name: 'Service B', squad: 'Squad 2', solution: 'Sol B', isActive: true, displayOrder: 2 }
    ];

    beforeEach(async () => {
        microserviceServiceSpy = jasmine.createSpyObj('MicroserviceService', ['getAllActive', 'delete']);
        toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        microserviceServiceSpy.getAllActive.and.returnValue(of(mockMicroservices));
        microserviceServiceSpy.delete.and.returnValue(of(void 0));

        await TestBed.configureTestingModule({
            imports: [MicroserviceDeleteModalComponent],
            providers: [
                { provide: MicroserviceService, useValue: microserviceServiceSpy },
                { provide: ToastService, useValue: toastServiceSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: {} }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MicroserviceDeleteModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load active microservices on init', () => {
        expect(microserviceServiceSpy.getAllActive).toHaveBeenCalled();
        expect(component.microservices.length).toBe(2);
        expect(component.isLoading).toBe(false);
    });

    it('should toggle selection', () => {
        component.toggleSelection('1');
        expect(component.isSelected('1')).toBe(true);

        component.toggleSelection('1');
        expect(component.isSelected('1')).toBe(false);
    });

    it('should delete selected microservices', () => {
        component.selectedIds.add('1');
        component.selectedIds.add('2');

        spyOn(window, 'confirm').and.returnValue(true);

        component.onDelete();

        expect(microserviceServiceSpy.delete).toHaveBeenCalledTimes(2);
        expect(toastServiceSpy.success).toHaveBeenCalled();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });

    it('should not delete if cancelled', () => {
        component.selectedIds.add('1');
        spyOn(window, 'confirm').and.returnValue(false);

        component.onDelete();

        expect(microserviceServiceSpy.delete).not.toHaveBeenCalled();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });
});
