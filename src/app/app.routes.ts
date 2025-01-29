import { Routes } from '@angular/router';
import { HomeComponent } from './home/home/home.component';
import { RedirectComponent } from './redirect/redirect.component';
import { AuthGuard } from './shared/guards/auth.guard';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'redirect', component: RedirectComponent },
  {
    path: 'maps',
    canActivate: [AuthGuard],
    loadComponent: () => import('./maps/maps.component'),
  },
  {
    path: 'markers',
    canActivate: [AuthGuard],
    loadComponent: () => import('./markers/marker.component'),
  },
  {
    path: 'atlas',
    canActivate: [AuthGuard],
    loadComponent: () => import('./markers/ui/atlas/atlas.component'),
  },
  {
    path: 'detail',
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
