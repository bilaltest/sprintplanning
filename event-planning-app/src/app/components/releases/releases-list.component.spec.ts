import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReleasesListComponent } from './releases-list.component';
import { ReleaseService } from '@services/release.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Release } from '@models/release.model';
import { FormsModule } from '@angular/forms';

describe('ReleasesListComponent', () => {
    let component: ReleasesListComponent;
    let fixture: ComponentFixture<ReleasesListComponent>;
    let releaseService: jest.Mocked<ReleaseService>;
    let toastService: jest.Mocked<ToastService>;
    let confirmationService: jest.Mocked<ConfirmationService>;
    let router: jest.Mocked<Router>;

    const mockReleases: Release[] = [
        {
            id: '1',
            name: 'Release 1',
            version: '1.0.0',
            releaseDate: '2025-01-01',
            status: 'draft',
            squads: []
        }
    ];

    beforeEach(async () => {
        const releaseServiceMock = {
            releases$: of(mockReleases),
            loadReleases: jest.fn(),
            createRelease: jest.fn(),
            deleteRelease: jest.fn()
        } as any;

        const toastServiceMock = {
            success: jest.fn(),
            error: jest.fn()
        } as any;

        const confirmationServiceMock = {
            confirm: jest.fn()
        } as any;

        const routerMock = {
            navigate: jest.fn()
        } as any;

        await TestBed.configureTestingModule({
            imports: [ReleasesListComponent, FormsModule],
            providers: [
                { provide: ReleaseService, useValue: releaseServiceMock },
                { provide: ToastService, useValue: toastServiceMock },
                { provide: ConfirmationService, useValue: confirmationServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ReleasesListComponent);
        component = fixture.componentInstance;
        releaseService = TestBed.inject(ReleaseService) as jest.Mocked<ReleaseService>;
        toastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;
        confirmationService = TestBed.inject(ConfirmationService) as jest.Mocked<ConfirmationService>;
        router = TestBed.inject(Router) as jest.Mocked<Router>;

        // Mock URL functions
        (window.URL as any).createObjectURL = jest.fn();
        (window.URL as any).revokeObjectURL = jest.fn();

        fixture.detectChanges();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load releases on init', () => {
        expect(releaseService.loadReleases).toHaveBeenCalled();
    });

    it('should navigate to release details', () => {
        component.viewRelease('1', '1.0.0');
        expect(router.navigate).toHaveBeenCalledWith(['/releases', '1.0.0']);

        component.viewRelease('1', undefined);
        expect(router.navigate).toHaveBeenCalledWith(['/releases', '1']);
    });

    it('should create release successfully', async () => {
        component.newRelease = {
            name: 'New Release',
            version: '2.0.0',
            releaseDate: '2025-02-01',
            description: 'Desc'
        } as any;

        const createdRelease = { ...mockReleases[0], id: '2', name: 'New Release' } as any;
        releaseService.createRelease.mockResolvedValue(createdRelease);

        await component.createRelease(new Event('submit'));

        expect(releaseService.createRelease).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Release' }));
        expect(toastService.success).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/releases', '2']);
        expect(component.showCreateModal).toBe(false);
    });

    it('should handle create release error', async () => {
        releaseService.createRelease.mockRejectedValue(new Error('Error'));
        await component.createRelease(new Event('submit'));
        expect(toastService.error).toHaveBeenCalled();
        expect(component.isCreating).toBe(false);
    });

    it('should delete release successfully', async () => {
        confirmationService.confirm.mockResolvedValue(true);
        releaseService.deleteRelease.mockResolvedValue();
        const event = { stopPropagation: jest.fn() } as any;
        await component.deleteRelease(event, mockReleases[0]);
        expect(confirmationService.confirm).toHaveBeenCalled();
        expect(releaseService.deleteRelease).toHaveBeenCalledWith('1');
        expect(toastService.success).toHaveBeenCalled();
    });

    it('should cancel delete release', async () => {
        confirmationService.confirm.mockResolvedValue(false);
        const event = { stopPropagation: jest.fn() } as any;
        await component.deleteRelease(event, mockReleases[0]);
        expect(releaseService.deleteRelease).not.toHaveBeenCalled();
    });

    it('should handle delete release error', async () => {
        confirmationService.confirm.mockResolvedValue(true);
        releaseService.deleteRelease.mockRejectedValue(new Error('Error'));
        const event = { stopPropagation: jest.fn() } as any;
        await component.deleteRelease(event, mockReleases[0]);
        expect(toastService.error).toHaveBeenCalled();
    });

    it('should toggle export menu', () => {
        component.toggleExportMenu('1');
        expect(component.exportMenuOpen).toBe('1');
        component.toggleExportMenu('1');
        expect(component.exportMenuOpen).toBeNull();
    });

    it('should export release as markdown', () => {
        const spy = jest.spyOn(document, 'createElement');
        const linkMock = { click: jest.fn(), href: '', download: '', setAttribute: jest.fn() } as any;
        spy.mockReturnValue(linkMock);
        component.exportRelease(mockReleases[0], 'markdown');
        expect(window.URL.createObjectURL).toHaveBeenCalled();
        expect(linkMock.click).toHaveBeenCalled();
        expect(linkMock.download).toContain('.md');
        spy.mockRestore();
    });

    it('should export release as html', () => {
        const spy = jest.spyOn(document, 'createElement');
        const linkMock = { click: jest.fn(), href: '', download: '', setAttribute: jest.fn() } as any;
        spy.mockReturnValue(linkMock);
        component.exportRelease(mockReleases[0], 'html');
        expect(window.URL.createObjectURL).toHaveBeenCalled();
        expect(linkMock.click).toHaveBeenCalled();
        expect(linkMock.download).toContain('.html');
        spy.mockRestore();
    });
});
