import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { calendarGuard } from './guards/calendar.guard';
import { releasesGuard } from './guards/releases.guard';

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
        canActivate: [calendarGuard],
        data: { breadcrumb: 'Calendrier' }
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/settings/settings.component').then(
            m => m.SettingsComponent
          ),
        canActivate: [calendarGuard],
        data: { breadcrumb: 'Paramètres' }
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./components/history/history.component').then(
            m => m.HistoryComponent
          ),
        canActivate: [calendarGuard],
        data: { breadcrumb: 'Historique' }
      },
      {
        path: 'releases',
        loadComponent: () =>
          import('./components/releases/releases-list.component').then(
            m => m.ReleasesListComponent
          ),
        canActivate: [releasesGuard],
        data: { breadcrumb: 'Préparation des MEP' }
      },
      {
        path: 'releases/:id',
        loadComponent: () =>
          import('./components/releases/release-detail.component').then(
            m => m.ReleaseDetailComponent
          ),
        canActivate: [releasesGuard],
        data: { breadcrumb: 'Détail MEP' }
      },
      {
        path: 'release-history',
        loadComponent: () =>
          import('./components/releases/release-history.component').then(
            m => m.ReleaseHistoryComponent
          ),
        canActivate: [releasesGuard],
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
      },
      {
        path: 'playground',
        loadComponent: () =>
          import('./components/playground/playground.component').then(
            m => m.PlaygroundComponent
          ),
        data: { breadcrumb: 'Playground' }
      },
      {
        path: 'playground/typing-fr',
        loadComponent: () =>
          import('./components/playground/typing-game/typing-game.component').then(
            m => m.TypingGameComponent
          ),
        data: { breadcrumb: 'Typing Challenge FR' }
      },
      {
        path: 'playground/typing-en',
        loadComponent: () =>
          import('./components/playground/typing-game/typing-game.component').then(
            m => m.TypingGameComponent
          ),
        data: { breadcrumb: 'Typing Challenge EN' }
      },
      {
        path: 'playground/memory-game',
        loadComponent: () =>
          import('./components/playground/memory-game/memory-game.component').then(
            m => m.MemoryGameComponent
          ),
        data: { breadcrumb: 'Memory Game' }
      },
      {
        path: 'playground/math-rush',
        loadComponent: () =>
          import('./components/playground/math-rush/math-rush.component').then(
            m => m.MathRushComponent
          ),
        data: { breadcrumb: 'Math Rush' }
      },
      {
        path: 'playground/flappy-dsi',
        loadComponent: () =>
          import('./components/playground/flappy-dsi/flappy-dsi.component').then(
            m => m.FlappyDsiComponent
          ),
        data: { breadcrumb: 'Flappy DSI' }
      }
    ]
  }
];
