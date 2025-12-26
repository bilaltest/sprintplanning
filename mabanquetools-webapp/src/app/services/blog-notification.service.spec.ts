import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BlogNotificationService } from './blog-notification.service';
import { BlogNotification } from '../models/blog.model';
import { environment } from '../../environments/environment';

describe('BlogNotificationService', () => {
  let service: BlogNotificationService;
  let httpMock: HttpTestingController;

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
      createdAt: '2024-12-15T10:00:00Z'
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
      createdAt: '2024-12-14T15:30:00Z'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BlogNotificationService]
    });
    service = TestBed.inject(BlogNotificationService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear constructor HTTP calls
    const constructorNotifReq = httpMock.expectOne(`${environment.apiUrl}/blog/notifications`);
    constructorNotifReq.flush([]);

    const constructorCountReq = httpMock.expectOne(`${environment.apiUrl}/blog/notifications/unread-count`);
    constructorCountReq.flush({ count: 0 });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadNotifications', () => {
    it('should load notifications and update subject', async () => {
      const loadPromise = service.loadNotifications();

      const req = httpMock.expectOne(`${environment.apiUrl}/blog/notifications`);
      expect(req.request.method).toBe('GET');
      req.flush(mockNotifications);

      await loadPromise;

      service.notifications$.subscribe(notifications => {
        expect(notifications).toEqual(mockNotifications);
        expect(notifications.length).toBe(2);
      });
    });

    it('should set loading state during load', async () => {
      const loadingStates: boolean[] = [];
      service.loading$.subscribe(loading => loadingStates.push(loading));

      const loadPromise = service.loadNotifications();

      const req = httpMock.expectOne(`${environment.apiUrl}/blog/notifications`);
      req.flush(mockNotifications);

      await loadPromise;

      expect(loadingStates).toContain(true);
      expect(loadingStates[loadingStates.length - 1]).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const loadPromise = service.loadNotifications();

      const req = httpMock.expectOne(`${environment.apiUrl}/blog/notifications`);
      req.error(new ErrorEvent('Network error'));

      await loadPromise;

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading notifications:',
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadUnreadCount', () => {
    it('should load unread count and update subject', async () => {
      const loadPromise = service.loadUnreadCount();

      const req = httpMock.expectOne('/api/blog/notifications/unread-count');
      expect(req.request.method).toBe('GET');
      req.flush({ count: 5 });

      await loadPromise;

      service.unreadCount$.subscribe(count => {
        expect(count).toBe(5);
      });
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const loadPromise = service.loadUnreadCount();

      const req = httpMock.expectOne('/api/blog/notifications/unread-count');
      req.error(new ErrorEvent('Network error'));

      await loadPromise;

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading unread count:',
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', fakeAsync(() => {
      service.markAsRead('notif1');

      // Expect PATCH request first
      const patchReq = httpMock.expectOne('/api/blog/notifications/notif1/mark-read');
      expect(patchReq.request.method).toBe('PATCH');
      patchReq.flush({});

      tick(); // Let the promise resolve

      // After PATCH, expect loadNotifications
      const loadReq = httpMock.expectOne(`${environment.apiUrl}/blog/notifications`);
      loadReq.flush(mockNotifications);

      tick(); // Let loadNotifications resolve

      // Then expect loadUnreadCount
      const countReq = httpMock.expectOne('/api/blog/notifications/unread-count');
      countReq.flush({ count: 0 });

      tick(); // Let everything finish
    }));

    it('should handle errors and rethrow', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const markPromise = service.markAsRead('notif1');

      const req = httpMock.expectOne('/api/blog/notifications/notif1/mark-read');
      req.error(new ErrorEvent('Network error'));

      try {
        await markPromise;
        fail('Should have thrown');
      } catch (error) {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error marking notification as read:',
          expect.any(Object)
        );
      }

      consoleErrorSpy.mockRestore();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', fakeAsync(() => {
      service.markAllAsRead();

      const patchReq = httpMock.expectOne('/api/blog/notifications/mark-all-read');
      expect(patchReq.request.method).toBe('PATCH');
      patchReq.flush({});

      tick(); // Let the promise resolve

      // After PATCH, expect loadNotifications
      const loadReq = httpMock.expectOne(`${environment.apiUrl}/blog/notifications`);
      loadReq.flush(mockNotifications);

      tick(); // Let loadNotifications resolve

      // Then expect loadUnreadCount
      const countReq = httpMock.expectOne('/api/blog/notifications/unread-count');
      countReq.flush({ count: 0 });

      tick(); // Let everything finish
    }));

    it('should handle errors and rethrow', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const markPromise = service.markAllAsRead();

      const req = httpMock.expectOne('/api/blog/notifications/mark-all-read');
      req.error(new ErrorEvent('Network error'));

      try {
        await markPromise;
        fail('Should have thrown');
      } catch (error) {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error marking all notifications as read:',
          expect.any(Object)
        );
      }

      consoleErrorSpy.mockRestore();
    });
  });

  describe('refresh', () => {
    it('should refresh both notifications and unread count', async () => {
      const refreshPromise = service.refresh();

      const loadReq = httpMock.expectOne(`${environment.apiUrl}/blog/notifications`);
      loadReq.flush(mockNotifications);

      const countReq = httpMock.expectOne('/api/blog/notifications/unread-count');
      countReq.flush({ count: 1 });

      await refreshPromise;

      service.notifications$.subscribe(notifications => {
        expect(notifications).toEqual(mockNotifications);
      });

      service.unreadCount$.subscribe(count => {
        expect(count).toBe(1);
      });
    });
  });
});
