import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: 'maps',
    loadComponent: () => import('./maps/maps.component'),
  },
  {
    path: 'markers',
    loadComponent: () => import('./markers/marker.component'),
  },
  {
    path: 'atlas',
    loadComponent: () => import('./markers/ui/atlas/atlas.component'),
  },
  {
    path: 'detail',
    loadComponent: () =>
      import('./markers/ui/marker-detail/marker-detail.component'),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
];
