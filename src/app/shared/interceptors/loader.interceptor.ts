import { HttpInterceptorFn } from '@angular/common/http';
import { LoaderService } from '../services/loader.service';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { COGNITO_URLS } from './cognito-urls';

export const LoaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  if (COGNITO_URLS.includes(req.url)) return next(req.clone());

  loaderService.isLoading.set(true);
  return next(req).pipe(finalize(() => loaderService.isLoading.set(false)));
};
