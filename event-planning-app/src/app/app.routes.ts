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
    redirectTo: 'planning',
    pathMatch: 'full'
  },
  {
    path: 'planning',
    loadComponent: () =>
      import('./components/timeline/timeline-container.component').then(
        m => m.TimelineContainerComponent
      ),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/settings/settings.component').then(
        m => m.SettingsComponent
      ),
    canActivate: [authGuard]
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./components/history/history.component').then(
        m => m.HistoryComponent
      ),
    canActivate: [authGuard]
  },
  {
    path: 'releases',
    loadComponent: () =>
      import('./components/releases/releases-list.component').then(
        m => m.ReleasesListComponent
      ),
    canActivate: [authGuard]
  },
  {
    path: 'releases/:id',
    loadComponent: () =>
      import('./components/releases/release-detail.component').then(
        m => m.ReleaseDetailComponent
      ),
    canActivate: [authGuard]
  }
];
