import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReleaseActionsComponent } from './release-actions.component';
import { ReleaseService } from '@services/release.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
import { Release, Squad, Action } from '@models/release.model';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ReleaseActionsComponent', () => {
    let component: ReleaseActionsComponent;
    let fixture: ComponentFixture<ReleaseActionsComponent>;
    let releaseServiceSpy: { addAction: jest.Mock, updateAction: jest.Mock, deleteAction: jest.Mock };
    let toastServiceSpy: { success: jest.Mock, error: jest.Mock, warning: jest.Mock };
    let confirmationServiceSpy: { confirm: jest.Mock };

    const mockAction: Action = {
        id: '1',
        description: 'Description 1',
        type: 'other',
        phase: 'pre_mep',
        squadId: 'squad1',
        status: 'pending',
        order: 0,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
    };

    const mockSquad: Squad = {
        id: 'squad1',
        releaseId: '1',
        squadNumber: 1,
        tontonMep: 'Tonton',
        actions: [mockAction],
        features: [],
        isCompleted: false,
        featuresEmptyConfirmed: false
    };

    const mockRelease: Release = {
        id: '1',
        name: 'Release Test',
        releaseDate: '2024-01-01',
        status: 'draft',
        type: 'release',
        slug: 'release-test',
        squads: [mockSquad]
    };

    beforeEach(async () => {
        releaseServiceSpy = {
            addAction: jest.fn(),
            updateAction: jest.fn(),
            deleteAction: jest.fn()
        };
        toastServiceSpy = {
            success: jest.fn(),
            error: jest.fn(),
            warning: jest.fn()
        };
        confirmationServiceSpy = { confirm: jest.fn() };

        await TestBed.configureTestingModule({
            imports: [ReleaseActionsComponent, HttpClientTestingModule],
            providers: [
                { provide: ReleaseService, useValue: releaseServiceSpy },
                { provide: ToastService, useValue: toastServiceSpy },
                { provide: ConfirmationService, useValue: confirmationServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ReleaseActionsComponent);
        component = fixture.componentInstance;
        component.release = mockRelease;
        component.phase = 'pre_mep';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should filter actions by phase', () => {
        const actions = component.getAllActions();
        expect(actions.length).toBe(1);
        expect(actions[0].phase).toBe('pre_mep');
    });

    it('should start adding new action', () => {
        component.startAddingAction();
        expect(component.isAddingAction).toBe(true);
        expect(component.editingActionId).toBeNull();
        expect(component.newAction.type).toBe('');
    });

    it('should start editing existing action', () => {
        component.startAddingAction(mockAction);
        expect(component.isAddingAction).toBe(true);
        expect(component.editingActionId).toBe('1');
        expect(component.newAction.description).toBe('Description 1');
    });

    it('should save new action', async () => {
        component.startAddingAction();
        component.newAction = {
            squadId: 'squad1',
            type: 'other',
            description: 'New Action',
            flipping: component.getEmptyFlippingConfig()
        };

        releaseServiceSpy.addAction.mockReturnValue(Promise.resolve({ ...mockAction, id: '2' }));

        await component.saveAction(new Event('submit'));

        expect(releaseServiceSpy.addAction).toHaveBeenCalled();
        expect(toastServiceSpy.success).toHaveBeenCalled();
        expect(component.isAddingAction).toBe(false);
    });

    it('should update existing action', async () => {
        component.startAddingAction(mockAction);
        component.newAction.description = 'Updated Description';

        releaseServiceSpy.updateAction.mockReturnValue(Promise.resolve({ ...mockAction, description: 'Updated Description' }));

        await component.saveAction(new Event('submit'));

        expect(releaseServiceSpy.updateAction).toHaveBeenCalledWith('1', expect.objectContaining({ description: 'Updated Description' }));
        expect(toastServiceSpy.success).toHaveBeenCalled();
    });

    it('should validate form fields', async () => {
        component.startAddingAction();
        // Empty form
        await component.saveAction(new Event('submit'));

        expect(toastServiceSpy.error).toHaveBeenCalledWith('Erreur', 'Veuillez sélectionner une squad');
        expect(releaseServiceSpy.addAction).not.toHaveBeenCalled();
    });

    it('should delete action after confirmation', async () => {
        confirmationServiceSpy.confirm.mockReturnValue(Promise.resolve(true));
        releaseServiceSpy.deleteAction.mockReturnValue(Promise.resolve());

        await component.deleteAction('squad1', '1');

        expect(confirmationServiceSpy.confirm).toHaveBeenCalled();
        expect(releaseServiceSpy.deleteAction).toHaveBeenCalledWith('1');
        expect(toastServiceSpy.success).toHaveBeenCalled();
    });

    it('should NOT delete action if cancelled', async () => {
        confirmationServiceSpy.confirm.mockReturnValue(Promise.resolve(false));

        await component.deleteAction('squad1', '1');

        expect(releaseServiceSpy.deleteAction).not.toHaveBeenCalled();
    });
});
