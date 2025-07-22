import { environment } from '../../../environments/environment';

export const COGNITO_URLS = [
  `https://cognito-idp.${environment.region}.amazonaws.com/${environment.user_pool_id}/.well-known/openid-configuration`,
  `https://cognito-idp.${environment.region}.amazonaws.com/${environment.user_pool_id}/.well-known/jwks.json`,
  `https://cloud-atlas-${environment.environment}.auth.${environment.region}.amazoncognito.com/oauth2/token`,
  `https://cloud-atlas-${environment.environment}.auth.${environment.region}.amazoncognito.com/oauth2/userInfo`,
];

export const S3_URL = `https://cloud-atlas-${environment.environment}-dump.s3.${environment.region}.amazonaws.com/`;