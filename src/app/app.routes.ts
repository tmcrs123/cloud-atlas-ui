import type { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing/landing.component';
import { RedirectComponent } from './redirect/redirect.component';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'redirect', component: RedirectComponent },
  {
    path: 'list',
    canActivate: [AuthGuard],
    loadComponent: () => import('./atlas/atlas-list.component').then((m) => m.AtlasListComponent),
  },
  {
    path: 'markers/:atlasId',
    canActivate: [AuthGuard],
    loadComponent: () => import('./markers/marker.component').then((m) => m.MarkerComponent),
  },
  {
    path: 'world/:atlasId',
    canActivate: [AuthGuard],
    loadComponent: () => import('./markers/ui/atlas/world-map.component').then((m) => m.WorldMapComponent),
  },
  {
    path: 'markers/:atlasId/marker/:markerId/detail',
    canActivate: [AuthGuard],
    loadComponent: () => import('./markers/ui/marker-detail/marker-detail.component').then((m) => m.MarkerDetailComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];
