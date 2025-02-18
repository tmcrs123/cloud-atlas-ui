import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { type Observable, of } from 'rxjs';
import type { LoginResponse } from 'angular-auth-oidc-client';
import { GoogleMapsAPIService } from '../shared/services/google-maps-api.service';

@Injectable({ providedIn: 'root' })
export class MockAuthService extends AuthService {
  private router = inject(Router);
  private googleMapsLoader = inject(GoogleMapsAPIService);

  constructor() {
    super();
    this.googleMapsLoader.load();
  }

  override idToken = '';

  public isAuthenticated = signal(false);

  exchangeCodeForToken(): Observable<LoginResponse> {
    return of({
      isAuthenticated: true,
      userData: null,
      accessToken: '',
      idToken: '',
    });
  }

  setIsAuthenticated(isAuthenticated: boolean): void {
    this.isAuthenticated.set(isAuthenticated)
  }

  login(): void {
    this.isAuthenticated.set(true);
    this.router.navigate(['redirect']);
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.router.navigate(['/']);
  }
}
