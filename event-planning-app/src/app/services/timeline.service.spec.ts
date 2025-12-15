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
        expect(state.view).toBe('quarter');
        expect(state.currentDate).toBeInstanceOf(Date);
    });

    it('should set view', () => {
        service.setView('quarter');
        expect(service.getCurrentState().view).toBe('quarter');
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

    // Note: nextPeriod() and previousPeriod() have been removed
    // Navigation is now handled directly by the quarterly-view component

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
