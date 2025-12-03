import { TestBed } from '@angular/core/testing';
import { TimelineService } from './timeline.service';
import { TimelineView } from '@models/timeline.model';

describe('TimelineService', () => {
    let service: TimelineService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimelineService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default state', () => {
        const state = service.getCurrentState();
        expect(state.view).toBe('annual');
        expect(state.currentDate).toBeInstanceOf(Date);
    });

    it('should set view', () => {
        service.setView('month');
        expect(service.getCurrentState().view).toBe('month');
    });

    it('should set current date', () => {
        const date = new Date(2025, 0, 1);
        service.setCurrentDate(date);
        expect(service.getCurrentState().currentDate).toEqual(date);
    });

    it('should select date', () => {
        const date = new Date(2025, 0, 15);
        service.selectDate(date);
        expect(service.getCurrentState().selectedDate).toEqual(date);
    });

    describe('nextPeriod', () => {
        it('should go to next year in annual view', () => {
            service.setView('annual');
            service.setCurrentDate(new Date(2025, 5, 15));

            service.nextPeriod();

            const newState = service.getCurrentState();
            expect(newState.currentDate.getFullYear()).toBe(2026);
            expect(newState.currentDate.getMonth()).toBe(0); // Should reset to January
        });

        it('should go to next month in month view', () => {
            service.setView('month');
            service.setCurrentDate(new Date(2025, 0, 15)); // Jan 2025

            service.nextPeriod();

            const newState = service.getCurrentState();
            expect(newState.currentDate.getMonth()).toBe(1); // Feb 2025
            expect(newState.currentDate.getFullYear()).toBe(2025);
        });
    });

    describe('previousPeriod', () => {
        it('should go to previous year in annual view', () => {
            service.setView('annual');
            service.setCurrentDate(new Date(2025, 5, 15));

            service.previousPeriod();

            const newState = service.getCurrentState();
            expect(newState.currentDate.getFullYear()).toBe(2024);
            expect(newState.currentDate.getMonth()).toBe(0); // Should reset to January
        });

        it('should go to previous month in month view', () => {
            service.setView('month');
            service.setCurrentDate(new Date(2025, 1, 15)); // Feb 2025

            service.previousPeriod();

            const newState = service.getCurrentState();
            expect(newState.currentDate.getMonth()).toBe(0); // Jan 2025
            expect(newState.currentDate.getFullYear()).toBe(2025);
        });
    });

    it('should go to today', (done) => {
        service.setCurrentDate(new Date(2020, 0, 1));

        service.scrollToToday$.subscribe(() => {
            const today = new Date();
            const stateDate = service.getCurrentState().currentDate;

            expect(stateDate.getDate()).toBe(today.getDate());
            expect(stateDate.getMonth()).toBe(today.getMonth());
            expect(stateDate.getFullYear()).toBe(today.getFullYear());
            done();
        });

        service.goToToday();
    });

    it('should get year months', () => {
        const months = service.getYearMonths(2025);
        expect(months.length).toBe(12);
        expect(months[0].getFullYear()).toBe(2025);
        expect(months[0].getMonth()).toBe(0);
        expect(months[11].getMonth()).toBe(11);
    });
});
