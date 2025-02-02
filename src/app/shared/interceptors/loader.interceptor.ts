import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { LoaderService } from '../services/loader.service';
import { COGNITO_URLS } from './external-urls';
import { ERROR_MESSAGE, INFO_MESSAGE } from '../tokens';
import { BannerService } from '../services/banner-service';

export const LoaderInterceptor: HttpInterceptorFn = (request, next) => {
  const loaderService = inject(LoaderService);
  const bannerService = inject(BannerService);

  if (COGNITO_URLS.includes(request.url)) return next(request.clone());

  loaderService.isLoading.set(true);
  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      bannerService.setMessage({
        message: request.context.has(ERROR_MESSAGE)
          ? request.context.get(ERROR_MESSAGE)
          : 'An error has occurred 💩',
        type: 'error',
      });

      return EMPTY;
    }),
    tap(() => {
      if (request.context.has(INFO_MESSAGE)) {
        bannerService.setMessage({
          message: request.context.get(INFO_MESSAGE),
          type: 'info',
        });
      }
    }),
    finalize(() => loaderService.isLoading.set(false))
  );
};
