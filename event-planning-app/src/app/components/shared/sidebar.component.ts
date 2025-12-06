import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarService } from '@services/sidebar.service';

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
          *ngFor="let item of navItems"
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

      <!-- Footer (Dark mode toggle) -->
      <div class="sidebar-footer">
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
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      @apply fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 flex flex-col;
      width: 280px;
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: 72px;
    }

    .sidebar-header {
      @apply p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between;
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
      @apply p-3 border-t border-gray-200 dark:border-gray-700;
    }
  `]
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  isDark = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard' },
    { label: 'Planning', icon: 'calendar_month', route: '/planning' },
    { label: 'Releases', icon: 'rocket_launch', route: '/releases' }
  ];

  constructor(
    private router: Router,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Check dark mode
    this.isDark = document.documentElement.classList.contains('dark');

    // Subscribe to sidebar state
    this.sidebarService.collapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  toggleDarkMode(): void {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
