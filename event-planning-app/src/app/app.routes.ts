import { Routes } from '@angular/router';

export const routes: Routes = [
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
];
