import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors, withJsonpSupport } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAuth } from 'angular-auth-oidc-client';
import { routes } from './app.routes';
import { authConfig } from './auth/auth.config';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { LoaderInterceptor } from './shared/interceptors/loader.interceptor';
import { GlobalErrorHandlerService } from './shared/services/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([AuthInterceptor, LoaderInterceptor]), withJsonpSupport()),
    provideAuth(authConfig),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService,
    },
  ],
};
