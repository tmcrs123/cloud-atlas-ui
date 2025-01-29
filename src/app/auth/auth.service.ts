import { effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom, map, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly oidcSecurityService = inject(OidcSecurityService);

  private _idToken: string = '';

  public get token(): string {
    return this._idToken;
  }

  private set token(value: string) {
    this._idToken = value;
  }

  public isAuthenticated = toSignal(
    this.oidcSecurityService.isAuthenticated$.pipe(
      map((auth) => auth.isAuthenticated)
    )
  );

  constructor() {
    effect(() => console.log('authenticated', this.isAuthenticated()));
  }

  // whether the user is authenticated
  checkAuth() {
    return firstValueFrom(this.oidcSecurityService.checkAuth());
  }

  exchangeCodeForToken() {
    return this.oidcSecurityService.getIdToken().pipe(
      tap((token) => (this._idToken = token)),
      switchMap(() => this.oidcSecurityService.checkAuth())
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
