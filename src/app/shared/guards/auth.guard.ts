import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { inject } from '@angular/core';

export const AuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const canNavigate = !!auth.isAuthenticated();

  if (!canNavigate) {
    console.log('auth guard CANNOT navigate');
    router.navigateByUrl('home');
    return false;
  }

  return true;
};
