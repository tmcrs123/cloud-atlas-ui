import type { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { COGNITO_URLS, S3_URLS } from './external-urls';
import { AuthService } from '../../auth/auth.service';

export function AuthInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService);

  if (COGNITO_URLS.includes(request.url)) return next(request.clone());
  if (S3_URLS.includes(request.url)) return next(request.clone());

  return next(
    request.clone({
      setHeaders: {
        // customauthheader: `${authService.idToken}`,
        customauthheader: `${authService.idToken}`,
      },
    })
  );
}
