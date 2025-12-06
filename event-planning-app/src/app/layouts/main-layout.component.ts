import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../components/shared/sidebar.component';
import { BreadcrumbComponent } from '../components/shared/breadcrumb.component';
import { SidebarService } from '@services/sidebar.service';

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
        <!-- Header with breadcrumb -->
        <div class="content-header">
          <app-breadcrumb></app-breadcrumb>
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
      @apply min-h-screen bg-gray-100 dark:bg-gray-950;
    }

    .main-content {
      @apply transition-all duration-300;
      margin-left: 280px;
    }

    .main-content.sidebar-collapsed {
      margin-left: 72px;
    }

    .content-header {
      @apply bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8;
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

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.sidebarService.collapsed$.subscribe(collapsed => {
      this.isSidebarCollapsed = collapsed;
    });
  }
}
