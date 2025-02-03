import { environment } from '../../../environments/environment';

export const COGNITO_URLS = [
  `https://cognito-idp.${environment.region}.amazonaws.com/${environment.userPoolId}/.well-known/openid-configuration`,
  `https://snappin-test.auth.${environment.region}.amazoncognito.com/oauth2/token`,
  `https://cognito-idp.${environment.region}.amazonaws.com/${environment.userPoolId}/.well-known/jwks.json`,
  `https://snappin-test.auth.${environment.region}.amazoncognito.com/oauth2/userInfo`,
];

export const S3_URLS = [`https://snappin-test-dump.s3.${environment.region}.amazonaws.com/`];
