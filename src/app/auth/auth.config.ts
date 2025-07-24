import { LogLevel, type PassedInitialConfig } from 'angular-auth-oidc-client';
import { environment } from '../../environments/environment';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: environment.authority,
    authWellknownEndpointUrl: environment.auth_well_known_endpoint_url,
    redirectUrl: environment.redirect_url,
    logLevel: LogLevel.None,
    postLogoutRedirectUri: environment.post_logout_redirect_uri,
    clientId: environment.client_id,
    scope: 'openid',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: Number.parseInt(environment.renew_time_before_token_expires),
  },
};
