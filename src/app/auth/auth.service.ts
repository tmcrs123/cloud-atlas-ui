import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { EMPTY, filter, map, Subject, switchMap, take, tap, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { BannerService } from '../shared/services/banner-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly bannerService = inject(BannerService);

  private _idToken: string = '';

  public get idToken(): string {
    return this._idToken;
  }

  private set idToken(value: string) {
    this._idToken = value;
  }

  public isAuthenticated = toSignal(this.oidcSecurityService.isAuthenticated$.pipe(map((auth) => auth.isAuthenticated)));

  private tokenExpirationTimer = new Subject<void>();
  private tokenExpirationTimer$ = this.tokenExpirationTimer.asObservable().pipe(
    switchMap(() =>
      timer(environment.idTokenExpirationInMiliseconds).pipe(
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
      // filter((loginResponse) => loginResponse.isAuthenticated),
      // switchMap(() => this.oidcSecurityService.getRefreshToken())
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

    window.location.href = `https://${environment.appName}-${environment.name}.auth.${environment.region}.amazoncognito.com/logout?client_id=${environment.clientId}&logout_uri=${environment.logoutUri}`;
  }
}
