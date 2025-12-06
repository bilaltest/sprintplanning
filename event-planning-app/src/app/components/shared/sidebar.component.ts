import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarService } from '@services/sidebar.service';
import { AuthService, User } from '@services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed">
      <!-- Logo / Brand -->
      <div class="sidebar-header" [class.collapsed]="isCollapsed">
        <div class="flex items-center space-x-3" *ngIf="!isCollapsed">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <span class="material-icons text-white">dashboard</span>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900 dark:text-white">Ma Banque</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">Tools</p>
          </div>
        </div>

        <!-- Toggle button -->
        <button
          (click)="toggleSidebar()"
          class="toggle-btn"
          [title]="isCollapsed ? 'Ouvrir la sidebar' : 'Fermer la sidebar'"
        >
          <span class="material-icons text-gray-600 dark:text-gray-300">
            {{ isCollapsed ? 'chevron_right' : 'chevron_left' }}
          </span>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <a
          *ngFor="let item of getVisibleNavItems()"
          [routerLink]="item.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
          class="nav-item"
          [class.collapsed]="isCollapsed"
          [title]="isCollapsed ? item.label : ''"
        >
          <span class="material-icons">{{ item.icon }}</span>
          <span *ngIf="!isCollapsed" class="nav-label">{{ item.label }}</span>
        </a>
      </nav>

      <!-- Footer (User info + Actions) -->
      <div class="sidebar-footer">
        <!-- User Info -->
        <div *ngIf="currentUser" class="user-info mb-3" [class.collapsed]="isCollapsed">
          <div *ngIf="!isCollapsed" class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center space-x-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                <span class="text-white font-semibold text-sm">
                  {{ currentUser.firstName.charAt(0) }}{{ currentUser.lastName.charAt(0) }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ currentUser.firstName }} {{ currentUser.lastName }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ currentUser.email }}
                </p>
              </div>
            </div>
          </div>
          <div *ngIf="isCollapsed" class="flex justify-center">
            <div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
              <span class="text-white font-semibold text-sm">
                {{ currentUser.firstName.charAt(0) }}{{ currentUser.lastName.charAt(0) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Dark Mode Toggle -->
        <button
          (click)="toggleDarkMode()"
          class="nav-item w-full"
          [class.collapsed]="isCollapsed"
          [title]="isCollapsed ? 'Changer de thème' : ''"
        >
          <span class="material-icons">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
          <span *ngIf="!isCollapsed" class="nav-label">
            {{ isDark ? 'Mode clair' : 'Mode sombre' }}
          </span>
        </button>

        <!-- Logout Button -->
        <button
          (click)="logout()"
          class="nav-item w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          [class.collapsed]="isCollapsed"
          [title]="isCollapsed ? 'Se déconnecter' : ''"
        >
          <span class="material-icons">logout</span>
          <span *ngIf="!isCollapsed" class="nav-label">Déconnexion</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      @apply fixed left-0 top-0 h-screen bg-white dark:bg-gray-750 border-r border-gray-200 dark:border-gray-600 transition-all duration-300 z-40 flex flex-col;
      width: 280px;
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: 72px;
    }

    .sidebar-header {
      @apply p-6 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between;
      white-space: nowrap;
    }

    .sidebar-header.collapsed {
      @apply justify-center p-4;
    }

    .toggle-btn {
      @apply p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors;
    }

    .sidebar-nav {
      @apply flex-1 py-6 px-3 space-y-1 overflow-y-auto;
    }

    .nav-item {
      @apply flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer;
    }

    .nav-item.collapsed {
      @apply justify-center px-0;
    }

    .nav-item.active {
      @apply bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium;
    }

    .nav-item .material-icons {
      @apply text-xl;
    }

    .nav-label {
      @apply text-sm;
    }

    .sidebar-footer {
      @apply p-3 border-t border-gray-200 dark:border-gray-600;
    }

    .user-info {
      @apply transition-all duration-200;
    }

    .user-info.collapsed {
      @apply mb-3;
    }
  `]
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  isDark = false;
  currentUser: User | null = null;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard' },
    { label: 'Planning', icon: 'calendar_month', route: '/planning' },
    { label: 'Releases', icon: 'rocket_launch', route: '/releases' },
    { label: 'Admin', icon: 'admin_panel_settings', route: '/admin' }
  ];

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to sidebar state
    this.sidebarService.collapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });

    // Subscribe to current user and apply their theme preference
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

      if (user && user.themePreference) {
        // Appliquer la préférence de thème de l'utilisateur
        this.isDark = user.themePreference === 'dark';
        this.applyTheme(this.isDark);
      } else {
        // Fallback sur le localStorage ou le thème par défaut
        const savedTheme = localStorage.getItem('theme');
        this.isDark = savedTheme === 'dark' || document.documentElement.classList.contains('dark');
        this.applyTheme(this.isDark);
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  async toggleDarkMode(): Promise<void> {
    this.isDark = !this.isDark;
    const theme = this.isDark ? 'dark' : 'light';

    // Appliquer le thème immédiatement
    this.applyTheme(this.isDark);

    // Sauvegarder localement (fallback)
    localStorage.setItem('theme', theme);

    // Sauvegarder dans la base de données si l'utilisateur est connecté
    if (this.currentUser) {
      await this.authService.updatePreferences(theme);
    }
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getVisibleNavItems(): NavItem[] {
    // Filtrer les items de navigation en fonction de l'utilisateur
    return this.navItems.filter(item => {
      // L'item Admin n'est visible que pour l'utilisateur "admin"
      if (item.route === '/admin') {
        return this.currentUser?.email === 'admin';
      }
      return true;
    });
  }

  isAdmin(): boolean {
    return this.currentUser?.email === 'admin';
  }
}
