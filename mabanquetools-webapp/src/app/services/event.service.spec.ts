import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventService } from './event.service';
import { PermissionService } from './permission.service';
import { environment } from '../../environments/environment';
import { Event } from '@models/event.model';

describe('EventService', () => {
    let service: EventService;
    let httpMock: HttpTestingController;
    let permissionService: any;
    const apiUrl = `${environment.apiUrl}/events`;

    const mockEvents: Event[] = [
        {
            id: '1',
            title: 'Event 1',
            date: '2025-01-01',
            startTime: '10:00',
            endTime: '11:00',
            category: 'mep',
            color: '#000000',
            icon: 'icon',
            description: 'desc',
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01'
        }
    ];

    beforeEach(() => {
        permissionService = {
            hasReadAccess: jest.fn().mockReturnValue(true),
            hasWriteAccess: jest.fn().mockReturnValue(true)
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                EventService,
                { provide: PermissionService, useValue: permissionService }
            ]
        });
        service = TestBed.inject(EventService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', fakeAsync(() => {
        expect(service).toBeTruthy();

        // Wait for setTimeout in constructor
        tick();

        // Handle the initial loadEvents call from constructor
        const req = httpMock.expectOne(apiUrl);
        req.flush(mockEvents);
    }));

    it('should load events on init', fakeAsync(() => {
        // Wait for setTimeout in constructor
        tick();

        const req = httpMock.expectOne(apiUrl);
        req.flush(mockEvents);

        tick();

        service.events$.subscribe(events => {
            expect(events.length).toBe(1);
            expect(events).toEqual(mockEvents);
        });
    }));

    it('should handle load events error', fakeAsync(() => {
        // Wait for setTimeout in constructor
        tick();

        const req = httpMock.expectOne(apiUrl);
        req.error(new ProgressEvent('error'));

        tick();

        service.loading$.subscribe(loading => {
            // Should be false after error
            expect(loading).toBe(false);
        });

        service.error$.subscribe(error => {
            expect(error).toBeTruthy();
        });
    }));

    it('should create event', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush(mockEvents);
        tick();

        const newEventData = {
            title: 'New Event',
            date: '2025-01-02',
            startTime: '12:00',
            endTime: '13:00',
            category: 'mep',
            color: '#ffffff',
            icon: 'new-icon',
            description: 'new desc'
        } as any;

        const createdEvent: Event = { ...newEventData, id: '2', createdAt: 'date', updatedAt: 'date' };

        const promise = service.createEvent(newEventData);

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('POST');
        req.flush(createdEvent);

        tick();

        // After create, it reloads events
        const reloadReq = httpMock.expectOne(apiUrl);
        expect(reloadReq.request.method).toBe('GET');
        reloadReq.flush([...mockEvents, createdEvent]);

        tick();

        promise.then(result => {
            expect(result).toEqual(createdEvent);
        });

        tick();
    }));

    it('should update event', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush(mockEvents);
        tick();

        const updates = { title: 'Updated Title' };
        const updatedEvent = { ...mockEvents[0], ...updates };

        const promise = service.updateEvent('1', updates);

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush(updatedEvent);

        tick();

        // Reloads events
        const reloadReq = httpMock.expectOne(apiUrl);
        reloadReq.flush([updatedEvent]);

        tick();

        promise.then(result => {
            expect(result).toEqual(updatedEvent);
        });

        tick();
    }));

    it('should delete event', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush(mockEvents);
        tick();

        const promise = service.deleteEvent('1');

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        tick();

        // Reloads events
        const reloadReq = httpMock.expectOne(apiUrl);
        reloadReq.flush([]);

        tick();

        promise.then(() => {
            expect(true).toBe(true);
        });

        tick();
    }));

    it('should duplicate event', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush(mockEvents);
        tick();

        const duplicatedEvent = { ...mockEvents[0], id: '2', title: 'Event 1 (copie)' };

        const promise = service.duplicateEvent('1');

        // Get event to duplicate
        const getReq = httpMock.expectOne(`${apiUrl}/1`);
        expect(getReq.request.method).toBe('GET');
        getReq.flush(mockEvents[0]);

        tick();

        // Create new event
        const createReq = httpMock.expectOne(apiUrl);
        expect(createReq.request.method).toBe('POST');
        createReq.flush(duplicatedEvent);

        tick();

        // Reload events
        const reloadReq = httpMock.expectOne(apiUrl);
        reloadReq.flush([...mockEvents, duplicatedEvent]);

        tick();

        promise.then(result => {
            expect(result).toEqual(duplicatedEvent);
        });

        tick();
    }));

    it('should move event', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush(mockEvents);
        tick();

        const newDate = '2025-02-01';
        const movedEvent = { ...mockEvents[0], date: newDate };

        const promise = service.moveEvent('1', newDate);

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({ date: newDate });
        req.flush(movedEvent);

        tick();

        // Reloads events
        const reloadReq = httpMock.expectOne(apiUrl);
        reloadReq.flush([movedEvent]);

        tick();

        promise.then(result => {
            expect(result).toEqual(movedEvent);
        });

        tick();
    }));

    it('should get event by id', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush(mockEvents);
        tick();

        service.getEventById('1').subscribe(event => {
            expect(event).toEqual(mockEvents[0]);
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockEvents[0]);

        tick();
    }));

    it('should clear all events', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush(mockEvents);
        tick();

        const promise = service.clearAllEvents();

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        tick();

        // Reloads events
        const reloadReq = httpMock.expectOne(apiUrl);
        reloadReq.flush([]);

        tick();

        promise.then(() => {
            expect(true).toBe(true);
        });

        tick();
    }));

    it('should import events', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush(mockEvents);
        tick();

        const newEvents = [mockEvents[0]];
        const promise = service.importEvents(newEvents);

        const req = httpMock.expectOne(`${apiUrl}/bulk`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ events: newEvents });
        req.flush({});

        tick();

        // Reloads events
        const reloadReq = httpMock.expectOne(apiUrl);
        reloadReq.flush(newEvents);

        tick();

        promise.then(() => {
            expect(true).toBe(true);
        });

        tick();
    }));

    it('should export events', fakeAsync(() => {
        // Wait for constructor
        tick();
        const initReq = httpMock.expectOne(apiUrl);
        initReq.flush(mockEvents);
        tick();

        const promise = service.exportEvents();

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockEvents);

        tick();

        promise.then(result => {
            expect(result).toEqual(mockEvents);
        });

        tick();
    }));
});
