import { type ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAuth } from 'angular-auth-oidc-client';
import { routes } from './app.routes';
import { authConfig } from './auth/auth.config';
import { MockAuthService } from './auth/mock-auth.service';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { LoaderInterceptor } from './shared/interceptors/loader.interceptor';
import { GlobalErrorHandlerService } from './shared/services/global-error-handler.service';
import { isEnvironment } from './shared/utils/is-env';
import { AuthService } from './auth/auth.service';
import { AwsAuthService } from './auth/aws-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([AuthInterceptor, LoaderInterceptor])),
    provideAuth(authConfig),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService,
    },
    {
      provide: AuthService,
      useClass: AwsAuthService
      // useFactory: () => (isEnvironment('local') || isEnvironment('demo') ? new MockAuthService() : new AwsAuthService()),
    },
  ],
};
