import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login.component').then(
        m => m.LoginComponent
      )
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/auth/register.component').then(
        m => m.RegisterComponent
      )
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout.component').then(
        m => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./components/home/home.component').then(
            m => m.HomeComponent
          ),
        data: { breadcrumb: 'Accueil' }
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./components/timeline/timeline-container.component').then(
            m => m.TimelineContainerComponent
          ),
        data: { breadcrumb: 'Calendrier' }
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/settings/settings.component').then(
            m => m.SettingsComponent
          ),
        data: { breadcrumb: 'Paramètres' }
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./components/history/history.component').then(
            m => m.HistoryComponent
          ),
        data: { breadcrumb: 'Historique' }
      },
      {
        path: 'releases',
        loadComponent: () =>
          import('./components/releases/releases-list.component').then(
            m => m.ReleasesListComponent
          ),
        data: { breadcrumb: 'Préparation des MEP' }
      },
      {
        path: 'releases/:id',
        loadComponent: () =>
          import('./components/releases/release-detail.component').then(
            m => m.ReleaseDetailComponent
          ),
        data: { breadcrumb: 'Détail MEP' }
      },
      {
        path: 'release-history',
        loadComponent: () =>
          import('./components/releases/release-history.component').then(
            m => m.ReleaseHistoryComponent
          ),
        data: { breadcrumb: 'Historique MEP' }
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./components/admin/admin.component').then(
            m => m.AdminComponent
          ),
        canActivate: [adminGuard],
        data: { breadcrumb: 'Administration' }
      }
    ]
  }
];
