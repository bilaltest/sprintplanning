import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { BlogNotification } from '../models/blog.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour la gestion des notifications blog
 * Gère la récupération, le marquage lu/non-lu, et le comptage des notifications
 */
@Injectable({ providedIn: 'root' })
export class BlogNotificationService {
  private apiUrl = `${environment.apiUrl}/blog/notifications`;

  private notificationsSubject = new BehaviorSubject<BlogNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  /**
   * Charger toutes les notifications de l'utilisateur connecté
   */
  async loadNotifications(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      const notifications = await firstValueFrom(
        this.http.get<BlogNotification[]>(this.apiUrl)
      );
      this.notificationsSubject.next(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Charger le nombre de notifications non lues
   */
  async loadUnreadCount(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`)
      );
      this.unreadCountSubject.next(response.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }

  /**
   * Marquer une notification comme lue
   * @param notificationId ID de la notification
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/${notificationId}/mark-read`, {})
      );
      await this.loadNotifications();
      await this.loadUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/mark-all-read`, {})
      );
      await this.loadNotifications();
      await this.loadUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Rafraîchir les notifications (polling manuel)
   */
  async refresh(): Promise<void> {
    await Promise.all([
      this.loadNotifications(),
      this.loadUnreadCount()
    ]);
  }
}
