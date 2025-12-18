import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventService } from './event.service';
import { environment } from '../../environments/environment';
import { Event } from '@models/event.model';

describe('EventService', () => {
    let service: EventService;
    let httpMock: HttpTestingController;
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
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [EventService]
        });
        service = TestBed.inject(EventService);
        httpMock = TestBed.inject(HttpTestingController);

        // Handle the initial loadEvents call from constructor
        const req = httpMock.expectOne(apiUrl);
        req.flush(mockEvents);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load events on init', () => {
        service.events$.subscribe(events => {
            expect(events.length).toBe(1);
            expect(events).toEqual(mockEvents);
        });
    });

    it('should create event', async () => {
        const newEventData = {
            title: 'New Event',
            date: '2025-01-02',
            startTime: '12:00',
            endTime: '13:00',
            category: 'mep',
            color: '#ffffff',
            icon: 'new-icon',
            description: 'new desc'
        };

        const createdEvent: Event = { ...newEventData, id: '2', createdAt: 'date', updatedAt: 'date' };

        const promise = service.createEvent(newEventData);

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('POST');
        req.flush(createdEvent);

        await new Promise(resolve => setTimeout(resolve, 0));

        // After create, it reloads events
        const reloadReq = httpMock.expectOne(apiUrl);
        expect(reloadReq.request.method).toBe('GET');
        reloadReq.flush([...mockEvents, createdEvent]);

        const result = await promise;
        expect(result).toEqual(createdEvent);
    });

    it('should update event', async () => {
        const updates = { title: 'Updated Title' };
        const updatedEvent = { ...mockEvents[0], ...updates };

        const promise = service.updateEvent('1', updates);

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush(updatedEvent);

        await new Promise(resolve => setTimeout(resolve, 0));

        // Reloads events
        const reloadReq = httpMock.expectOne(apiUrl);
        reloadReq.flush([updatedEvent]);

        const result = await promise;
        expect(result).toEqual(updatedEvent);
    });

    it('should delete event', async () => {
        const promise = service.deleteEvent('1');

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        await new Promise(resolve => setTimeout(resolve, 0));

        // Reloads events
        const reloadReq = httpMock.expectOne(apiUrl);
        reloadReq.flush([]);

        await promise;
    });

    it('should duplicate event', async () => {
        const duplicatedEvent = { ...mockEvents[0], id: '2', title: 'Event 1 (copie)' };

        const promise = service.duplicateEvent('1');

        // Get event to duplicate
        const getReq = httpMock.expectOne(`${apiUrl}/1`);
        expect(getReq.request.method).toBe('GET');
        getReq.flush(mockEvents[0]);

        await new Promise(resolve => setTimeout(resolve, 0));

        // Create new event
        const createReq = httpMock.expectOne(apiUrl);
        expect(createReq.request.method).toBe('POST');
        createReq.flush(duplicatedEvent);

        await new Promise(resolve => setTimeout(resolve, 0));

        // Reload events
        const reloadReq = httpMock.expectOne(apiUrl);
        reloadReq.flush([...mockEvents, duplicatedEvent]);

        const result = await promise;
        expect(result).toEqual(duplicatedEvent);
    });

    it('should move event', async () => {
        const newDate = '2025-02-01';
        const movedEvent = { ...mockEvents[0], date: newDate };

        const promise = service.moveEvent('1', newDate);

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({ date: newDate });
        req.flush(movedEvent);

        await new Promise(resolve => setTimeout(resolve, 0));

        // Reloads events
        const reloadReq = httpMock.expectOne(apiUrl);
        reloadReq.flush([movedEvent]);

        const result = await promise;
        expect(result).toEqual(movedEvent);
    });

    it('should get event by id', (done) => {
        service.getEventById('1').subscribe(event => {
            expect(event).toEqual(mockEvents[0]);
            done();
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockEvents[0]);
    });

    it('should clear all events', async () => {
        const promise = service.clearAllEvents();

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        await new Promise(resolve => setTimeout(resolve, 0));

        // Reloads events
        const reloadReq = httpMock.expectOne(apiUrl);
        reloadReq.flush([]);

        await promise;
    });

    it('should import events', async () => {
        const newEvents = [mockEvents[0]];
        const promise = service.importEvents(newEvents);

        const req = httpMock.expectOne(`${apiUrl}/bulk`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ events: newEvents });
        req.flush({});

        await new Promise(resolve => setTimeout(resolve, 0));

        // Reloads events
        const reloadReq = httpMock.expectOne(apiUrl);
        reloadReq.flush(newEvents);

        await promise;
    });

    it('should export events', async () => {
        const promise = service.exportEvents();

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockEvents);

        const result = await promise;
        expect(result).toEqual(mockEvents);
    });
});
