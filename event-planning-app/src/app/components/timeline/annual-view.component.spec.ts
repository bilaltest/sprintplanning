import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnualViewComponent } from './annual-view.component';
import { TimelineService } from '@services/timeline.service';
import { SettingsService } from '@services/settings.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { TimelineState } from '@models/timeline.model';
import { UserPreferences, DEFAULT_PREFERENCES } from '@models/settings.model';
import { Event } from '@models/event.model';

describe('AnnualViewComponent', () => {
  let component: AnnualViewComponent;
  let fixture: ComponentFixture<AnnualViewComponent>;
  let timelineService: jasmine.SpyObj<TimelineService>;
  let settingsService: jasmine.SpyObj<SettingsService>;

  const mockTimelineState: TimelineState = {
    view: 'annual',
    currentDate: new Date(2025, 0, 1) // January 1, 2025
  };

  const mockPreferences: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    theme: 'light',
    weekStart: 'monday'
  };

  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Test Event',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      category: 'mep',
      color: '#22c55e',
      icon: 'rocket_launch',
      description: 'Test description',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z'
    }
  ];

  beforeEach(async () => {
    const timelineServiceSpy = jasmine.createSpyObj('TimelineService', [], {
      state$: new BehaviorSubject(mockTimelineState),
      scrollToToday$: new BehaviorSubject<void>(undefined)
    });

    const settingsServiceSpy = jasmine.createSpyObj('SettingsService', ['getCurrentPreferences'], {
      preferences$: new BehaviorSubject(mockPreferences)
    });
    settingsServiceSpy.getCurrentPreferences.and.returnValue(mockPreferences);

    await TestBed.configureTestingModule({
      imports: [AnnualViewComponent, HttpClientTestingModule],
      providers: [
        { provide: TimelineService, useValue: timelineServiceSpy },
        { provide: SettingsService, useValue: settingsServiceSpy }
      ]
    }).compileComponents();

    timelineService = TestBed.inject(TimelineService) as jasmine.SpyObj<TimelineService>;
    settingsService = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;

    fixture = TestBed.createComponent(AnnualViewComponent);
    component = fixture.componentInstance;
    component.events = mockEvents;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('handleDayClick', () => {
    it('should show detail panel when clicking on a day with events', () => {
      // Arrange
      const dayWithEvents = new Date(2025, 0, 15); // January 15, 2025 (has an event)

      // Act
      component.handleDayClick(dayWithEvents);

      // Assert
      expect(component.selectedDay).toEqual(dayWithEvents);
    });

    it('should emit addEventClick when clicking on a day without events', () => {
      // Arrange
      const dayWithoutEvents = new Date(2025, 0, 20); // January 20, 2025 (no events)
      spyOn(component.addEventClick, 'emit');

      // Act
      component.handleDayClick(dayWithoutEvents);

      // Assert
      expect(component.addEventClick.emit).toHaveBeenCalledWith('2025-01-20');
      expect(component.selectedDay).toBeNull();
    });

    it('should show detail panel with correct events for the selected day', () => {
      // Arrange
      const dayWithEvents = new Date(2025, 0, 15);

      // Act
      component.handleDayClick(dayWithEvents);
      const eventsForDay = component.getEventsForDay(dayWithEvents);

      // Assert
      expect(eventsForDay.length).toBe(1);
      expect(eventsForDay[0].title).toBe('Test Event');
    });
  });

  describe('getEventsForDay', () => {
    it('should return events for the correct day', () => {
      // Arrange
      const day = new Date(2025, 0, 15);

      // Act
      const events = component.getEventsForDay(day);

      // Assert
      expect(events.length).toBe(1);
      expect(events[0].title).toBe('Test Event');
    });

    it('should return empty array for day without events', () => {
      // Arrange
      const day = new Date(2025, 0, 20);

      // Act
      const events = component.getEventsForDay(day);

      // Assert
      expect(events.length).toBe(0);
    });

    it('should return empty array when events input is null', () => {
      // Arrange
      component.events = null;
      const day = new Date(2025, 0, 15);

      // Act
      const events = component.getEventsForDay(day);

      // Assert
      expect(events.length).toBe(0);
    });
  });

  describe('closeDetails', () => {
    it('should close the detail panel', () => {
      // Arrange
      component.selectedDay = new Date(2025, 0, 15);

      // Act
      component.closeDetails();

      // Assert
      expect(component.selectedDay).toBeNull();
    });
  });

  describe('onEventClick', () => {
    it('should emit eventClick when an event is clicked', () => {
      // Arrange
      spyOn(component.eventClick, 'emit');
      const event = mockEvents[0];

      // Act
      component.onEventClick(event);

      // Assert
      expect(component.eventClick.emit).toHaveBeenCalledWith(event);
    });
  });

  describe('onDeleteEvent', () => {
    it('should emit deleteEventClick when user confirms deletion', () => {
      // Arrange
      spyOn(component.deleteEventClick, 'emit');
      spyOn(window, 'confirm').and.returnValue(true);
      const event = mockEvents[0];
      const mouseEvent = new MouseEvent('click');
      spyOn(mouseEvent, 'stopPropagation');

      // Act
      component.onDeleteEvent(mouseEvent, event);

      // Assert
      expect(mouseEvent.stopPropagation).toHaveBeenCalled();
      expect(window.confirm).toHaveBeenCalled();
      expect(component.deleteEventClick.emit).toHaveBeenCalledWith(event);
    });

    it('should not emit deleteEventClick when user cancels deletion', () => {
      // Arrange
      spyOn(component.deleteEventClick, 'emit');
      spyOn(window, 'confirm').and.returnValue(false);
      const event = mockEvents[0];
      const mouseEvent = new MouseEvent('click');

      // Act
      component.onDeleteEvent(mouseEvent, event);

      // Assert
      expect(component.deleteEventClick.emit).not.toHaveBeenCalled();
    });
  });
});
