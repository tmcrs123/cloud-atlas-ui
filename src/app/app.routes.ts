import { Routes } from '@angular/router';
import { RedirectComponent } from './redirect/redirect.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { LandingComponent } from './landing/landing/landing.component';
export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'redirect', component: RedirectComponent },
  {
    path: 'maps',
    canActivate: [AuthGuard],
    loadComponent: () => import('./maps/maps.component'),
  },
  {
    path: 'markers/:mapId',
    canActivate: [AuthGuard],
    loadComponent: () => import('./markers/marker.component'),
  },
  {
    path: 'atlas/:mapId',
    canActivate: [AuthGuard],
    loadComponent: () => import('./markers/ui/atlas/atlas.component'),
  },
  {
    path: 'markers/:mapId/marker/:markerId/detail',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./markers/ui/marker-detail/marker-detail.component'),
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];
