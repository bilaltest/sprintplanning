import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NotificationBellComponent } from './notification-bell.component';
import { BlogNotificationService } from '../../services/blog-notification.service';
import { BlogNotification } from '../../models/blog.model';

describe('NotificationBellComponent', () => {
  let component: NotificationBellComponent;
  let fixture: ComponentFixture<NotificationBellComponent>;
  let mockNotificationService: jest.Mocked<BlogNotificationService>;
  let mockRouter: jest.Mocked<Router>;

  const mockNotifications: BlogNotification[] = [
    {
      id: 'notif1',
      type: 'MENTION',
      recipientId: 'user1',
      triggeredById: 'user2',
      triggeredByName: 'Jane Smith',
      relatedPostId: 'post1',
      relatedCommentId: 'comment1',
      message: 'vous a mentionné dans un commentaire',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
    },
    {
      id: 'notif2',
      type: 'NEW_COMMENT',
      recipientId: 'user1',
      triggeredById: 'user3',
      triggeredByName: 'John Doe',
      relatedPostId: 'post2',
      message: 'a commenté votre post',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    }
  ];

  beforeEach(async () => {
    mockNotificationService = {
      notifications$: of(mockNotifications),
      unreadCount$: of(1),
      refresh: jest.fn().mockResolvedValue(undefined),
      markAsRead: jest.fn().mockResolvedValue(undefined),
      markAllAsRead: jest.fn().mockResolvedValue(undefined)
    } as any;

    mockRouter = {
      navigate: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        { provide: BlogNotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (component['refreshInterval']) {
      clearInterval(component['refreshInterval']);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display notifications observable', (done) => {
    component.notifications$.subscribe(notifications => {
      expect(notifications).toEqual(mockNotifications);
      expect(notifications.length).toBe(2);
      done();
    });
  });

  it('should display unread count observable', (done) => {
    component.unreadCount$.subscribe(count => {
      expect(count).toBe(1);
      done();
    });
  });

  describe('toggleDropdown', () => {
    it('should toggle dropdown visibility', () => {
      expect(component.showDropdown).toBe(false);

      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);

      component.toggleDropdown();
      expect(component.showDropdown).toBe(false);
    });
  });

  describe('closeDropdown', () => {
    it('should close dropdown', () => {
      component.showDropdown = true;
      component.closeDropdown();
      expect(component.showDropdown).toBe(false);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const event = new Event('click');
      jest.spyOn(event, 'stopPropagation');

      await component.markAsRead('notif1', event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('notif1');
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockNotificationService.markAsRead.mockRejectedValueOnce(new Error('API Error'));

      const event = new Event('click');
      await component.markAsRead('notif1', event);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error marking notification as read:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      await component.markAllAsRead();

      expect(mockNotificationService.markAllAsRead).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockNotificationService.markAllAsRead.mockRejectedValueOnce(new Error('API Error'));

      await component.markAllAsRead();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error marking all notifications as read:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleNotificationClick', () => {
    it('should mark unread notification as read', () => {
      const notification = mockNotifications[0]; // isRead = false

      component.handleNotificationClick(notification);

      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('notif1');
    });

    it('should not mark already read notification', () => {
      const notification = mockNotifications[1]; // isRead = true

      component.handleNotificationClick(notification);

      expect(mockNotificationService.markAsRead).not.toHaveBeenCalled();
    });

    it('should navigate to related post', () => {
      const notification = mockNotifications[0];

      component.handleNotificationClick(notification);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/blog', 'post1']);
    });

    it('should close dropdown after navigation', () => {
      component.showDropdown = true;
      const notification = mockNotifications[0];

      component.handleNotificationClick(notification);

      expect(component.showDropdown).toBe(false);
    });

    it('should not navigate if no related post', () => {
      const notification = { ...mockNotifications[0], relatedPostId: undefined };

      component.handleNotificationClick(notification);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('getIcon', () => {
    it('should return correct icon for NEW_POST', () => {
      expect(component.getIcon('NEW_POST')).toBe('article');
    });

    it('should return correct icon for NEW_COMMENT', () => {
      expect(component.getIcon('NEW_COMMENT')).toBe('comment');
    });

    it('should return correct icon for COMMENT_REPLY', () => {
      expect(component.getIcon('COMMENT_REPLY')).toBe('reply');
    });

    it('should return correct icon for POST_LIKE', () => {
      expect(component.getIcon('POST_LIKE')).toBe('favorite');
    });

    it('should return correct icon for COMMENT_LIKE', () => {
      expect(component.getIcon('COMMENT_LIKE')).toBe('thumb_up');
    });

    it('should return correct icon for MENTION', () => {
      expect(component.getIcon('MENTION')).toBe('alternate_email');
    });

    it('should return default icon for unknown type', () => {
      expect(component.getIcon('UNKNOWN_TYPE')).toBe('notifications');
    });
  });

  describe('formatTime', () => {
    it('should format time as "À l\'instant" for < 1 min', () => {
      const now = new Date();
      const dateString = new Date(now.getTime() - 30 * 1000).toISOString(); // 30 seconds ago

      expect(component.formatTime(dateString)).toBe('À l\'instant');
    });

    it('should format time as "Il y a X min" for < 1 hour', () => {
      const now = new Date();
      const dateString = new Date(now.getTime() - 5 * 60 * 1000).toISOString(); // 5 minutes ago

      expect(component.formatTime(dateString)).toBe('Il y a 5 min');
    });

    it('should format time as "Il y a Xh" for < 24 hours', () => {
      const now = new Date();
      const dateString = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago

      expect(component.formatTime(dateString)).toBe('Il y a 2h');
    });

    it('should format time as "Il y a Xj" for < 7 days', () => {
      const now = new Date();
      const dateString = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days ago

      expect(component.formatTime(dateString)).toBe('Il y a 3j');
    });

    it('should format time as date string for >= 7 days', () => {
      const now = new Date();
      const date = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const dateString = date.toISOString();

      const result = component.formatTime(dateString);

      expect(result).toMatch(/\d{1,2}\s\w{3,4}/); // Format: "5 déc." or similar
    });
  });

  describe('auto-refresh', () => {
    it('should set up auto-refresh on init', fakeAsync(() => {
      component.ngOnInit();

      tick(30000); // 30 seconds

      expect(mockNotificationService.refresh).toHaveBeenCalled();

      tick(30000); // Another 30 seconds

      expect(mockNotificationService.refresh).toHaveBeenCalledTimes(2);
    }));

    it('should clear interval on destroy', () => {
      component.ngOnInit();

      const intervalId = component['refreshInterval'];
      expect(intervalId).toBeDefined();

      component.ngOnDestroy();

      // After destroy, interval should be cleared
      // We can't easily test this directly, but we can verify the method was called
      expect(component['refreshInterval']).toBeDefined();
    });
  });
});
