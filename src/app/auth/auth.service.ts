import { effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { filter, firstValueFrom, map, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly oidcSecurityService = inject(OidcSecurityService);

  private _idToken: string = '';

  public get idToken(): string {
    return this._idToken;
  }

  private set idToken(value: string) {
    this._idToken = value;
  }

  public isAuthenticated = toSignal(
    this.oidcSecurityService.isAuthenticated$.pipe(
      map((auth) => auth.isAuthenticated)
    )
  );

  exchangeCodeForToken() {
    return this.oidcSecurityService.checkAuth().pipe(
      tap((loginResponse) => (this.idToken = loginResponse.idToken)),
      filter((loginResponse) => loginResponse.isAuthenticated),
      switchMap(() => this.oidcSecurityService.getRefreshToken())
    );
  }

  login(): void {
    this.oidcSecurityService.authorize();
  }

  logout(): void {
    this.oidcSecurityService.logoff().subscribe(console.log);
    // Clear session storage
    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }

    window.location.href =
      'https://snappin-test.auth.us-east-1.amazoncognito.com/logout?client_id=7ocqnpg4b45h239cc3p9pke5kf&logout_uri=http://localhost:4200';
  }
}
