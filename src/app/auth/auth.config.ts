import { LogLevel, PassedInitialConfig } from 'angular-auth-oidc-client';
import { environment } from '../../environments/environment';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: environment.authority,
    authWellknownEndpointUrl: environment.authWellknownEndpointUrl,
    redirectUrl: environment.redirectUrl,
    logLevel: LogLevel.Error,
    postLogoutRedirectUri: environment.postLogoutRedirectUri,
    clientId: environment.clientId,
    scope: 'openid',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds:
      environment.renewTimeBeforeTokenExpiresInSeconds,
  },
};
