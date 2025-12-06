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
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Content -->
      <main class="main-content" [class.sidebar-collapsed]="isSidebarCollapsed">
        <!-- Header with breadcrumb and contextual actions -->
        <div class="content-header">
          <app-breadcrumb></app-breadcrumb>

          <!-- Planning Contextual Actions -->
          <div class="contextual-actions" *ngIf="isPlanningRoute">
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
              title="Paramètres du planning"
            >
              <span class="material-icons">settings</span>
              <span class="action-label">Paramètres</span>
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
      @apply min-h-screen bg-gray-100 dark:bg-gray-800;
    }

    .main-content {
      @apply transition-all duration-300;
      margin-left: 280px;
    }

    .main-content.sidebar-collapsed {
      margin-left: 72px;
    }

    .content-header {
      @apply bg-white dark:bg-gray-750 border-b border-gray-200 dark:border-gray-600 px-8 flex items-center justify-between;
    }

    .contextual-actions {
      @apply flex items-center space-x-2;
    }

    .action-btn {
      @apply flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200;
    }

    .action-btn .material-icons {
      @apply text-lg;
    }

    .action-label {
      @apply text-sm;
    }

    .content-body {
      @apply p-8;
    }

    /* Responsive: collapse sidebar on mobile */
    @media (max-width: 768px) {
      .main-content {
        margin-left: 72px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  isSidebarCollapsed = false;
  isPlanningRoute = false;

  constructor(
    private sidebarService: SidebarService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Récupérer les infos utilisateur depuis l'API pour avoir les préférences à jour
    this.authService.fetchCurrentUser();

    this.sidebarService.collapsed$.subscribe(collapsed => {
      this.isSidebarCollapsed = collapsed;
    });

    // Check if current route is planning
    this.checkPlanningRoute(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkPlanningRoute(event.url);
      });
  }

  private checkPlanningRoute(url: string): void {
    this.isPlanningRoute = url.startsWith('/planning');
  }
}
