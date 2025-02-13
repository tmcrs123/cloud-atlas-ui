import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { EMPTY, Subject, map, switchMap, take, tap, timer } from 'rxjs';
import { environment } from '../../environments/environment.js';
import { BannerService } from '../shared/services/banner-service.js';
import { AuthService } from './auth.service.js';

@Injectable({
  providedIn: 'root',
})
export class AwsAuthService extends AuthService {
  private readonly bannerService = inject(BannerService);
  private readonly oidcSecurityService = inject(OidcSecurityService);

  private _idToken = '';

  public get idToken(): string {
    return this._idToken;
  }

  private set idToken(value: string) {
    this._idToken = value;
  }

  public isAuthenticated = toSignal(this.oidcSecurityService.isAuthenticated$.pipe(map((auth) => auth.isAuthenticated)), { initialValue: false });

  private tokenExpirationTimer = new Subject<void>();
  private tokenExpirationTimer$ = this.tokenExpirationTimer.asObservable().pipe(
    switchMap(() =>
      timer(Number.parseInt(environment.idTokenExpirationInMiliseconds)).pipe(
        take(1),
        tap(() => {
          this.bannerService.setMessage({ message: 'Your session has expired. For security reasons you will be logged out 🔒', type: 'info' });
          this.logout();
          return EMPTY;
        })
      )
    )
  );

  exchangeCodeForToken() {
    this.tokenExpirationTimer$.subscribe();

    return this.oidcSecurityService.checkAuth().pipe(
      tap((loginResponse) => {
        this.idToken = loginResponse.idToken;
        this.tokenExpirationTimer.next();
      })
    );
  }

  login(): void {
    this.oidcSecurityService.authorize();
  }

  logout(): void {
    this.oidcSecurityService.logoff().subscribe();
    // Clear session storage
    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }

    window.location.href = `https://${environment.appName}.auth.${environment.region}.amazoncognito.com/logout?client_id=${environment.clientId}&logout_uri=${environment.logoutUri}`;
  }
}
