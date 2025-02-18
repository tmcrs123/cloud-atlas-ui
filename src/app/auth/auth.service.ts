import type { Signal } from '@angular/core';
import type { LoginResponse } from 'angular-auth-oidc-client';
import type { Observable } from 'rxjs';

export abstract class AuthService {
  abstract isAuthenticated: Signal<boolean>;
  abstract idToken: string;
  abstract exchangeCodeForToken(): Observable<LoginResponse>;
  abstract login(): void;
  abstract logout(): void;
}
