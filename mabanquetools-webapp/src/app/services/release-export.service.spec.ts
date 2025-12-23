import { TestBed } from '@angular/core/testing';
import { Release, Action, Squad } from '@models/release.model';
import { ReleaseExportService } from './release-export.service';

describe('ReleaseExportService', () => {
    let service: ReleaseExportService;

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
        releaseId: 'rel1',
        squadNumber: 1,
        tontonMep: 'Tonton',
        isCompleted: false,
        featuresEmptyConfirmed: false,
        features: [],
        actions: [mockAction]
    };

    const mockRelease: Release = {
        id: 'rel1',
        name: 'Release Test',
        releaseDate: '2024-01-01T00:00:00Z',
        status: 'draft',
        type: 'release',
        slug: 'release-test',
        squads: [mockSquad],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ReleaseExportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should expand and generate Markdown content', () => {
        // Spy on private/internal methods if possible or check output
        // Since generateMarkdown is private, we check the public exportRelease via download

        // Mock download to avoid actual browser download
        const downloadSpy = jest.spyOn(service as any, 'downloadFile').mockImplementation(() => { });

        service.exportRelease(mockRelease, 'markdown');

        expect(downloadSpy).toHaveBeenCalled();
        const args = downloadSpy.mock.calls[0];
        expect(args[1]).toContain('.md');
        expect(args[2]).toBe('text/markdown');
        expect(args[0]).toContain('# Release Test');
        expect(args[0]).toContain('Tonton');
    });

    it('should expand and generate HTML content', () => {
        const downloadSpy = jest.spyOn(service as any, 'downloadFile').mockImplementation(() => { });

        service.exportRelease(mockRelease, 'html');

        expect(downloadSpy).toHaveBeenCalled();
        const args = downloadSpy.mock.calls[0];
        expect(args[1]).toContain('.html');
        expect(args[2]).toBe('text/html');
        expect(args[0]).toContain('<!DOCTYPE html>');
        expect(args[0]).toContain('Release Test');
    });

    it('should group actions correctly by type', () => {
        // Accessing private method for testing via any cast
        const actions: Action[] = [
            { ...mockAction, type: 'feature_flipping', id: '2' },
            { ...mockAction, type: 'memory_flipping', id: '3' },
            { ...mockAction, type: 'other', id: '4' }
        ];

        const grouped = (service as any).groupActionsByType(actions);
        expect(grouped.feature_flipping.length).toBe(1);
        expect(grouped.memory_flipping.length).toBe(1);
        expect(grouped.other.length).toBe(1);
    });
});
