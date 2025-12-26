import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BlogNotificationService } from '../../services/blog-notification.service';
import { BlogNotification } from '../../models/blog.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-bell">
      <button
        class="bell-button"
        (click)="toggleDropdown()"
        [class.has-unread]="(unreadCount$ | async)! > 0"
        aria-label="Notifications">
        <span class="material-icons">notifications</span>
        <span *ngIf="(unreadCount$ | async)! > 0" class="badge">
          {{ (unreadCount$ | async)! > 99 ? '99+' : (unreadCount$ | async) }}
        </span>
      </button>

      <!-- Dropdown -->
      <div *ngIf="showDropdown" class="notifications-dropdown">
        <!-- Header -->
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <button
            *ngIf="(unreadCount$ | async)! > 0"
            (click)="markAllAsRead()"
            class="mark-all-read">
            Tout marquer comme lu
          </button>
        </div>

        <!-- List -->
        <div class="notifications-list">
          <div
            *ngFor="let notification of notifications$ | async"
            class="notification-item"
            [class.unread]="!notification.isRead"
            (click)="handleNotificationClick(notification)">

            <div class="notification-icon">
              <span class="material-icons">{{ getIcon(notification.type) }}</span>
            </div>

            <div class="notification-content">
              <p class="notification-message">
                <strong>{{ notification.triggeredByName }}</strong>
                {{ notification.message }}
              </p>
              <p class="notification-time">{{ formatTime(notification.createdAt) }}</p>
            </div>

            <button
              *ngIf="!notification.isRead"
              (click)="markAsRead(notification.id, $event)"
              class="mark-read-btn"
              aria-label="Marquer comme lu">
              <span class="material-icons">check</span>
            </button>
          </div>

          <div *ngIf="(notifications$ | async)?.length === 0" class="empty-state">
            <span class="material-icons">notifications_none</span>
            <p>Aucune notification</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      *ngIf="showDropdown"
      class="backdrop"
      (click)="closeDropdown()">
    </div>
  `,
  styles: [`
    .notification-bell {
      position: relative;
    }

    .bell-button {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: var(--text-color);
      transition: color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bell-button:hover {
      color: var(--primary-color);
    }

    .bell-button.has-unread .material-icons {
      color: var(--primary-color);
      animation: ring 2s ease-in-out infinite;
    }

    @keyframes ring {
      0%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(-10deg); }
      20%, 40% { transform: rotate(10deg); }
    }

    .badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 4px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .notifications-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 360px;
      max-height: 500px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }

    :host-context(.dark) .notifications-dropdown {
      background: var(--gray-800);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .dropdown-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .mark-all-read {
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 12px;
      cursor: pointer;
      padding: 4px 8px;
      transition: opacity 0.2s;
    }

    .mark-all-read:hover {
      opacity: 0.8;
    }

    .notifications-list {
      overflow-y: auto;
      max-height: 400px;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      cursor: pointer;
      transition: background 0.2s;
    }

    .notification-item:hover {
      background: var(--gray-50);
    }

    :host-context(.dark) .notification-item:hover {
      background: var(--gray-700);
    }

    .notification-item.unread {
      background: #eff6ff;
    }

    :host-context(.dark) .notification-item.unread {
      background: rgba(59, 130, 246, 0.1);
    }

    .notification-icon .material-icons {
      color: var(--primary-color);
      font-size: 20px;
    }

    .notification-content {
      flex: 1;
    }

    .notification-message {
      margin: 0 0 4px;
      font-size: 14px;
      color: var(--text-color);
    }

    .notification-time {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .mark-read-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--text-secondary);
      transition: color 0.2s;
    }

    .mark-read-btn:hover {
      color: var(--primary-color);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      color: var(--text-secondary);
    }

    .empty-state .material-icons {
      font-size: 48px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 999;
      background: transparent;
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  showDropdown = false;
  notifications$ = this.notificationService.notifications$;
  unreadCount$ = this.notificationService.unreadCount$;
  private refreshInterval: any;

  constructor(
    private notificationService: BlogNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Auto-refresh toutes les 30 secondes
    this.refreshInterval = setInterval(() => {
      this.notificationService.refresh();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  async markAsRead(notificationId: string, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      await this.notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await this.notificationService.markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  handleNotificationClick(notification: BlogNotification): void {
    // Marquer comme lue
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id);
    }

    // Rediriger vers le post ou commentaire
    if (notification.relatedPostId) {
      this.router.navigate(['/blog', notification.relatedPostId]);
      this.closeDropdown();
    }
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      NEW_POST: 'article',
      NEW_COMMENT: 'comment',
      COMMENT_REPLY: 'reply',
      POST_LIKE: 'favorite',
      COMMENT_LIKE: 'thumb_up',
      MENTION: 'alternate_email'
    };
    return icons[type] || 'notifications';
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
