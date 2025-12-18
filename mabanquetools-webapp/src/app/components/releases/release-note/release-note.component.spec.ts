import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReleaseNoteComponent } from './release-note.component';
import { ReleaseService } from '@services/release.service';
import { ReleaseNoteService } from '@services/release-note.service';
import { MicroserviceService } from '@services/microservice.service';
import { ToastService } from '@services/toast.service';
import { PermissionService } from '@services/permission.service';
import { ConfirmationService } from '@services/confirmation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Release } from '@models/release.model';
import { Microservice } from '@models/microservice.model';
import { ReleaseNoteEntry } from '@models/release-note.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('ReleaseNoteComponent', () => {
    let component: ReleaseNoteComponent;
    let fixture: ComponentFixture<ReleaseNoteComponent>;
    let releaseService: jest.Mocked<ReleaseService>;
    let releaseNoteService: jest.Mocked<ReleaseNoteService>;
    let microserviceService: jest.Mocked<MicroserviceService>;
    let permissionService: jest.Mocked<PermissionService>;

    const mockRelease: Release = {
        id: '1',
        slug: 'release-1',
        name: 'Release 1',
        releaseDate: '2025-01-01',
        status: 'draft',
        type: 'release',
        squads: []
    };

    const mockMicroservices: Microservice[] = [
        { id: 'ms1', name: 'Microservice 1', squad: 'Squad 1', isActive: true },
        { id: 'ms2', name: 'Microservice 2', squad: 'Squad 1', isActive: true },
        { id: 'ms3', name: 'Microservice 3', squad: 'Squad 2', isActive: true }
    ];

    const mockEntries: ReleaseNoteEntry[] = [
        {
            id: 'e1',
            releaseId: '1',
            microserviceId: 'ms1',
            microservice: 'Microservice 1',
            squad: 'Squad 1',
            partEnMep: true,
            changes: []
        }
    ];

    beforeEach(async () => {
        const releaseServiceMock = {
            getRelease: jest.fn().mockResolvedValue(mockRelease)
        } as any;

        const releaseNoteServiceMock = {
            getAllEntries: jest.fn().mockReturnValue(of(mockEntries)),
            createEntry: jest.fn(),
            updateEntry: jest.fn(),
            deleteEntry: jest.fn()
        } as any;

        const microserviceServiceMock = {
            getAllActive: jest.fn().mockReturnValue(of(mockMicroservices))
        } as any;

        const permissionServiceMock = {
            hasWriteAccess: jest.fn().mockReturnValue(true)
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

        const activeRouteMock = {
            snapshot: {
                paramMap: {
                    get: jest.fn().mockReturnValue('1')
                }
            }
        } as any;

        const dialogMock = {
            open: jest.fn()
        } as any;

        await TestBed.configureTestingModule({
            imports: [ReleaseNoteComponent, FormsModule, CommonModule],
            providers: [
                { provide: ReleaseService, useValue: releaseServiceMock },
                { provide: ReleaseNoteService, useValue: releaseNoteServiceMock },
                { provide: MicroserviceService, useValue: microserviceServiceMock },
                { provide: PermissionService, useValue: permissionServiceMock },
                { provide: ToastService, useValue: toastServiceMock },
                { provide: ConfirmationService, useValue: confirmationServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: activeRouteMock },
                { provide: MatDialog, useValue: dialogMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ReleaseNoteComponent);
        component = fixture.componentInstance;
        releaseService = TestBed.inject(ReleaseService) as jest.Mocked<ReleaseService>;
        releaseNoteService = TestBed.inject(ReleaseNoteService) as jest.Mocked<ReleaseNoteService>;
        microserviceService = TestBed.inject(MicroserviceService) as jest.Mocked<MicroserviceService>;
        permissionService = TestBed.inject(PermissionService) as jest.Mocked<PermissionService>;

        fixture.detectChanges();
        // Wait for async loadRelease
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load release, entries and microservices on init', () => {
        expect(releaseService.getRelease).toHaveBeenCalledWith('1');
        expect(releaseNoteService.getAllEntries).toHaveBeenCalledWith('1');
        expect(microserviceService.getAllActive).toHaveBeenCalled();
    });

    it('should merge entries and microservices correctly with solution', () => {
        // We have 3 microservices and 1 existing entry (ms1)
        // microservice mock data needs solution for test
        const msWithSolution = [
            { id: 'ms1', name: 'Microservice 1', squad: 'Squad A', isActive: true, solution: 'SOL-001' },
            { id: 'ms2', name: 'Microservice 2', squad: 'Squad A', isActive: true, solution: 'SOL-002' },
            { id: 'ms3', name: 'Microservice 3', squad: 'Squad B', isActive: true } // No solution
        ];

        // Force applyFilters
        component.microservices = msWithSolution;
        component.entries = [...mockEntries];
        component.release = mockRelease;

        component.applyFilters();

        const grouped = component.groupedEntries;

        const squadA = grouped.find(g => g.squad === 'Squad A');
        const ms1Entry = squadA?.entries.find(e => e.microserviceId === 'ms1');
        expect(ms1Entry?.solution).toBe('SOL-001');

        const ms2Entry = squadA?.entries.find(e => e.microserviceId === 'ms2');
        expect(ms2Entry?.solution).toBe('SOL-002');
    });

    it('should filter by partEnMep', () => {
        // Setup entries: one true, one false (placeholder or existing false)
        component.microservices = mockMicroservices; // ms1, ms2, ms3
        // ms1 is in mockEntries with partEnMep: true
        component.entries = [...mockEntries];
        component.release = mockRelease;

        // Initial state: show all (2 squads, 3 entries)
        component.applyFilters();
        let total = component.groupedEntries.reduce((acc, g) => acc + g.entries.length, 0);
        expect(total).toBe(3);

        // Filter ON
        component.showOnlyPartEnMep = true;
        component.applyFilters();

        total = component.groupedEntries.reduce((acc, g) => acc + g.entries.length, 0);
        expect(total).toBe(1); // Only ms1
        expect(component.groupedEntries[0].entries[0].microserviceId).toBe('ms1');

        // Filter OFF
        component.showOnlyPartEnMep = false;
        component.applyFilters();
        total = component.groupedEntries.reduce((acc, g) => acc + g.entries.length, 0);
        expect(total).toBe(3);
    });

    it('should filter by solution', () => {
        const msWithSolution = [
            { id: 'ms1', name: 'Microservice 1', squad: 'Squad A', isActive: true, solution: 'ALPHA' },
            { id: 'ms2', name: 'Microservice 2', squad: 'Squad A', isActive: true, solution: 'BETA' },
        ];

        component.microservices = msWithSolution;
        component.entries = [];
        component.release = mockRelease;

        // Search for "ALPHA"
        component.searchQuery = 'ALPHA';
        component.applyFilters();

        let grouped = component.groupedEntries;
        let squadA = grouped.find(g => g.squad === 'Squad A');
        expect(squadA?.entries.length).toBe(1);
        expect(squadA?.entries[0].solution).toBe('ALPHA');

        // Search for "Microservice 2" (name)
        component.searchQuery = 'Microservice 2';
        component.applyFilters();

        grouped = component.groupedEntries;
        squadA = grouped.find(g => g.squad === 'Squad A');
        expect(squadA?.entries.length).toBe(1);
        expect(squadA?.entries[0].microservice).toBe('Microservice 2');
    });

    it('should create new entry when toggling partEnMep on placeholder', () => {
        // Setup placeholder for ms2
        const placeholderEntry: ReleaseNoteEntry = {
            releaseId: '1',
            microserviceId: 'ms2',
            microservice: 'Microservice 2',
            squad: 'Squad A',
            partEnMep: false,
            changes: []
        };

        component.release = mockRelease;

        // Switch to true
        placeholderEntry.partEnMep = true;

        releaseNoteService.createEntry.mockReturnValue(of({
            ...placeholderEntry,
            id: 'new-id',
            partEnMep: true
        } as ReleaseNoteEntry));

        component.togglePartEnMep(placeholderEntry);

        expect(releaseNoteService.createEntry).toHaveBeenCalledWith('1', expect.objectContaining({
            microserviceId: 'ms2',
            partEnMep: true
        }));
    });

    it('should update existing entry when toggling partEnMep', () => {
        const existingEntry = mockEntries[0]; // ms1, partEnMep: true
        existingEntry.partEnMep = false;

        component.release = mockRelease;

        releaseNoteService.updateEntry.mockReturnValue(of({
            ...existingEntry,
            partEnMep: false
        }));

        component.togglePartEnMep(existingEntry);

        expect(releaseNoteService.updateEntry).toHaveBeenCalledWith('1', 'e1', expect.objectContaining({
            partEnMep: false
        }));
    });

    it('should update field via updateField method', () => {
        const existingEntry: ReleaseNoteEntry = {
            id: 'e1',
            releaseId: '1',
            microserviceId: 'ms1',
            microservice: 'Microservice 1',
            squad: 'Squad A',
            partEnMep: true,
            tag: 'v1.0',
            changes: []
        };

        component.release = mockRelease;

        releaseNoteService.updateEntry.mockReturnValue(of({
            ...existingEntry,
            tag: 'v1.1'
        }));

        component.updateField(existingEntry, 'tag', 'v1.1');

        expect(releaseNoteService.updateEntry).toHaveBeenCalledWith('1', 'e1', expect.objectContaining({
            microserviceId: 'ms1',
            tag: 'v1.1'
        }));
    });
});
