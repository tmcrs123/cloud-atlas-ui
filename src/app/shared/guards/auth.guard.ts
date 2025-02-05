import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

export const AuthGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const canNavigate = !!auth.isAuthenticated();

  if (!canNavigate) {
    router.navigateByUrl('home');
    return false;
  }

  return true;
};
