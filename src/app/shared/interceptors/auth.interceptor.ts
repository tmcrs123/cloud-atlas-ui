import type { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { COGNITO_URLS, S3_URL } from './external-urls';
import { AuthService } from '../../auth/auth.service';

export function AuthInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService);

  console.log('request.url is:' , request.url);

  if (COGNITO_URLS.includes(request.url)) {
    console.log('url matched cognito');
    return next(request.clone());
  }
  if (request.url.includes(S3_URL)) {
    console.log('url matched s3');
    return next(request.clone());
  }

  console.log('adding token...', authService.idToken);
  return next(
    request.clone({
      setHeaders: {
        Authorization: `${authService.idToken}`,
      },
    })
  );
}
