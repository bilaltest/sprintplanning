import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login.component').then(
        m => m.LoginComponent
      )
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then(
        m => m.HomeComponent
      ),
    canActivate: [authGuard]
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/planning-layout.component').then(
        m => m.PlanningLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'planning',
        loadComponent: () =>
          import('./components/timeline/timeline-container.component').then(
            m => m.TimelineContainerComponent
          )
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/settings/settings.component').then(
            m => m.SettingsComponent
          )
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./components/history/history.component').then(
            m => m.HistoryComponent
          )
      }
    ]
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/releases-layout.component').then(
        m => m.ReleasesLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'releases',
        loadComponent: () =>
          import('./components/releases/releases-list.component').then(
            m => m.ReleasesListComponent
          )
      },
      {
        path: 'releases/:id',
        loadComponent: () =>
          import('./components/releases/release-detail.component').then(
            m => m.ReleaseDetailComponent
          )
      }
    ]
  }
];
