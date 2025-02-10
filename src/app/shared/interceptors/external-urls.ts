import { environment } from '../../../environments/environment.js';

export const COGNITO_URLS = [
  `https://cognito-idp.${environment.region}.amazonaws.com/${environment.userPoolId}/.well-known/openid-configuration`,
  `https://cognito-idp.${environment.region}.amazonaws.com/${environment.userPoolId}/.well-known/jwks.json`,
  `https://cloud-atlas-${environment.environmentName}.auth.${environment.region}.amazoncognito.com/oauth2/token`,
  `https://cloud-atlas-${environment.environmentName}.auth.${environment.region}.amazoncognito.com/oauth2/userInfo`,
];

export const S3_URLS = [`https://cloud-atlas-${environment.environmentName}-dump.s3.${environment.region}.amazonaws.com/`];
