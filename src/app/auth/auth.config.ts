import { LogLevel, type PassedInitialConfig } from 'angular-auth-oidc-client';
import { environment } from '../../environments/environment.js';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: environment.authority,
    authWellknownEndpointUrl: environment.authWellknownEndpointUrl,
    redirectUrl: environment.redirectUrl,
    logLevel: LogLevel.Debug,
    postLogoutRedirectUri: environment.postLogoutRedirectUri,
    clientId: environment.clientId,
    scope: 'openid',
    responseType: 'code',
    silentRenew: false,
    useRefreshToken: false,
    renewTimeBeforeTokenExpiresInSeconds: environment.renewTimeBeforeTokenExpiresInSeconds,
  },
};
