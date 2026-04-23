import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Home · Weather Forecast',
    data: { animation: 'home' },
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./pages/favorites-page/favorites-page.component').then((m) => m.FavoritesPageComponent),
    title: 'Favorites · Weather Forecast',
    data: { animation: 'favorites' },
  },
  {
    path: 'compare',
    loadComponent: () =>
      import('./pages/compare-page/compare-page.component').then((m) => m.ComparePageComponent),
    title: 'Compare · Weather Forecast',
    data: { animation: 'compare' },
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings-page/settings-page.component').then((m) => m.SettingsPageComponent),
    title: 'Settings · Weather Forecast',
    data: { animation: 'settings' },
  },
  {
    path: 'map',
    loadComponent: () => import('./pages/map-page/map-page.component').then((m) => m.MapPageComponent),
    title: 'Map · Weather Forecast',
    data: { animation: 'map' },
  },
  { path: '**', redirectTo: '' },
];
