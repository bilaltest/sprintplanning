import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReleasePreparationComponent } from './release-preparation.component';
import { ReleaseService } from '@services/release.service';
import { ReleaseExportService } from '@services/release-export.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Release, Squad } from '@models/release.model';
import { Component, Input } from '@angular/core';

// Mock Child Components
@Component({
    selector: 'app-release-tontons',
    standalone: true,
    template: ''
})
class MockReleaseTontonsComponent {
    @Input() release: any;
    @Input() isExpanded = false;
}

@Component({
    selector: 'app-release-actions',
    standalone: true,
    template: ''
})
class MockReleaseActionsComponent {
    @Input() release: any;
    @Input() phase: any;
    @Input() isExpanded = false;
}

describe('ReleasePreparationComponent', () => {
    let component: ReleasePreparationComponent;
    let fixture: ComponentFixture<ReleasePreparationComponent>;
    let releaseServiceSpy: { getRelease: jest.Mock };
    let exportServiceSpy: { exportRelease: jest.Mock };
    let routerSpy: { navigate: jest.Mock };

    const mockRelease: Release = {
        id: '1',
        name: 'Release Test',
        releaseDate: '2024-01-01',
        status: 'draft',
        type: 'release',
        slug: 'release-test',
        squads: [
            { id: 'sq1', squadNumber: 1, actions: [] } as Squad
        ]
    };

    beforeEach(async () => {
        releaseServiceSpy = { getRelease: jest.fn() };
        exportServiceSpy = { exportRelease: jest.fn() };
        routerSpy = { navigate: jest.fn() };

        await TestBed.configureTestingModule({
            imports: [ReleasePreparationComponent, MockReleaseTontonsComponent, MockReleaseActionsComponent],
            providers: [
                { provide: ReleaseService, useValue: releaseServiceSpy },
                { provide: ReleaseExportService, useValue: exportServiceSpy },
                { provide: Router, useValue: routerSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => '1'
                            }
                        }
                    }
                }
            ]
        })
            .overrideComponent(ReleasePreparationComponent, {
                remove: { imports: [] },
                add: { imports: [MockReleaseTontonsComponent, MockReleaseActionsComponent] }
            })
            .compileComponents();

        fixture = TestBed.createComponent(ReleasePreparationComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        releaseServiceSpy.getRelease.mockReturnValue(Promise.resolve(mockRelease));
        expect(component).toBeTruthy();
    });

    it('should load release on init', async () => {
        releaseServiceSpy.getRelease.mockReturnValue(Promise.resolve(mockRelease));

        await component.ngOnInit();

        expect(releaseServiceSpy.getRelease).toHaveBeenCalledWith('1');
        expect(component.release).toEqual(mockRelease);
    });

    it('should navigate back if release not found', async () => {
        releaseServiceSpy.getRelease.mockReturnValue(Promise.resolve(null as any));

        await component.ngOnInit();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/releases']);
    });

    it('should call export service on export', () => {
        component.release = mockRelease;
        component.exportRelease('markdown');
        expect(exportServiceSpy.exportRelease).toHaveBeenCalledWith(mockRelease, 'markdown');
    });

    it('should toggle sections', () => {
        component.toggleSection('tontons');
        expect(component.expandedSections.has('tontons')).toBe(false); // Was initially true
        component.toggleSection('tontons');
        expect(component.expandedSections.has('tontons')).toBe(true);
    });
});
