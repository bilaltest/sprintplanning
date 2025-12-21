import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { SidebarComponent } from '../components/shared/sidebar.component';
import { BreadcrumbComponent } from '../components/shared/breadcrumb.component';
import { SidebarService } from '@services/sidebar.service';
import { AuthService } from '@services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, BreadcrumbComponent],
  template: `
    <div class="app-container">
      <!-- Mobile Hamburger Menu Button -->
      <button
        class="mobile-menu-btn"
        (click)="openMobileMenu()"
        title="Ouvrir le menu"
      >
        <span class="material-icons">menu</span>
      </button>

      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Content -->
      <main class="main-content" [class.sidebar-collapsed]="isSidebarCollapsed">
        <!-- Header with breadcrumb and contextual actions -->
        <div class="content-header">
          <app-breadcrumb></app-breadcrumb>

          <!-- Calendrier Contextual Actions -->
          <div class="contextual-actions" *ngIf="isCalendarRoute">
            <button
              routerLink="/history"
              class="action-btn"
              title="Historique des événements"
            >
              <span class="material-icons">history</span>
              <span class="action-label">Historique</span>
            </button>
            <button
              routerLink="/settings"
              class="action-btn"
              title="Paramètres du calendrier"
            >
              <span class="material-icons">settings</span>
              <span class="action-label">Paramètres</span>
            </button>
          </div>

          <!-- Releases Contextual Actions -->
          <div class="contextual-actions" *ngIf="isReleasesRoute">
            <button
              routerLink="/release-history"
              class="action-btn"
              title="Historique des releases"
            >
              <span class="material-icons">history</span>
              <span class="action-label">Historique</span>
            </button>
          </div>
        </div>

        <!-- Page content -->
        <div class="content-body">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      @apply min-h-screen bg-gray-100 dark:bg-gray-800 relative;
    }

    /* Mobile Hamburger Button */
    .mobile-menu-btn {
      @apply fixed top-4 left-4 z-[1001] p-2 bg-white dark:bg-gray-750 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors;
    }

    .mobile-menu-btn .material-icons {
      @apply text-gray-700 dark:text-gray-300;
    }

    /* Hide hamburger on tablet and desktop */
    @media (min-width: 641px) {
      .mobile-menu-btn {
        display: none;
      }
    }

    /* Main Content */
    .main-content {
      @apply transition-all duration-300;
    }

    /* Desktop: Full sidebar (280px) */
    @media (min-width: 1024px) {
      .main-content {
        margin-left: 280px;
      }

      .main-content.sidebar-collapsed {
        margin-left: 72px;
      }
    }

    /* Tablet (iPad Portrait): Collapsed sidebar (72px) */
    @media (min-width: 641px) and (max-width: 1023px) {
      .main-content {
        margin-left: 72px;
      }
    }

    /* Mobile (Samsung S25, iPhone): No sidebar margin (overlay) */
    @media (max-width: 640px) {
      .main-content {
        margin-left: 0;
      }
    }

    .content-header {
      @apply bg-white dark:bg-gray-750 border-b border-gray-200 dark:border-gray-600 px-4 md:px-8 py-3 md:py-0 flex items-center justify-between flex-wrap gap-3;
    }

    .contextual-actions {
      @apply flex items-center space-x-2;
    }

    .action-btn {
      @apply flex items-center space-x-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200;
    }

    .action-btn .material-icons {
      @apply text-lg;
    }

    .action-label {
      @apply text-sm hidden sm:inline;
    }

    .content-body {
      @apply p-4 md:p-8;
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  isSidebarCollapsed = false;
  isCalendarRoute = false;
  isReleasesRoute = false;

  constructor(
    private sidebarService: SidebarService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Récupérer les infos utilisateur depuis l'API pour avoir les préférences à jour
    this.authService.fetchCurrentUser();

    this.sidebarService.collapsed$.subscribe(collapsed => {
      this.isSidebarCollapsed = collapsed;
    });

    // Check if current route is planning or releases
    this.checkRoutes(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkRoutes(event.url);
      });
  }

  private checkRoutes(url: string): void {
    this.isCalendarRoute = url.startsWith('/calendar') || url.startsWith('/history') || url.startsWith('/settings');
    this.isReleasesRoute = url.startsWith('/releases') || url.startsWith('/release-history');
  }

  openMobileMenu(): void {
    this.sidebarService.openMobileMenu();
  }
}
