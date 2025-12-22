import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReleaseTontonsComponent } from './release-tontons.component';
import { ReleaseService } from '@services/release.service';
import { ToastService } from '@services/toast.service';
import { Release, Squad } from '@models/release.model';
import { By } from '@angular/platform-browser';

describe('ReleaseTontonsComponent', () => {
    let component: ReleaseTontonsComponent;
    let fixture: ComponentFixture<ReleaseTontonsComponent>;
    let releaseServiceSpy: { updateSquad: jest.Mock };
    let toastServiceSpy: { success: jest.Mock, error: jest.Mock };

    const mockSquad: Squad = {
        id: 'squad1',
        squadNumber: 1,
        tontonMep: 'OldTonton',
        actions: [],
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
        releaseServiceSpy = { updateSquad: jest.fn() };
        toastServiceSpy = { success: jest.fn(), error: jest.fn() };

        await TestBed.configureTestingModule({
            imports: [ReleaseTontonsComponent, HttpClientTestingModule],
            providers: [
                { provide: ReleaseService, useValue: releaseServiceSpy },
                { provide: ToastService, useValue: toastServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ReleaseTontonsComponent);
        component = fixture.componentInstance;
        component.release = mockRelease;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle expanded state', () => {
        jest.spyOn(component.toggleExpand, 'emit');
        component.toggleExpanded();
        expect(component.toggleExpand.emit).toHaveBeenCalled();
    });

    it('should update Tonton MEP if value changed', async () => {
        releaseServiceSpy.updateSquad.mockReturnValue(Promise.resolve());

        await component.updateTontonMep('squad1', 'NewTonton');

        expect(releaseServiceSpy.updateSquad).toHaveBeenCalledWith('squad1', { tontonMep: 'NewTonton' });
        expect(mockSquad.tontonMep).toBe('NewTonton'); // Check local partial update
    });

    it('should NOT update Tonton MEP if value unchanged', async () => {
        mockSquad.tontonMep = 'SameTonton';
        component.release = { ...mockRelease }; // trigger change detection if needed, or just direct call

        await component.updateTontonMep('squad1', 'SameTonton');

        expect(releaseServiceSpy.updateSquad).not.toHaveBeenCalled();
    });

    it('should handle error during update', async () => {
        releaseServiceSpy.updateSquad.mockReturnValue(Promise.reject('Error'));

        await component.updateTontonMep('squad1', 'FailTonton');

        expect(toastServiceSpy.error).toHaveBeenCalled();
    });
});
