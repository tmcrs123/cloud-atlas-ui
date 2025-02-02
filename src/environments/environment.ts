export const environment = {
  name: 'test',
  api_endpoint: 'http://localhost:3000',
  // api_endpoint: 'https://uhkjuwv5j1.execute-api.us-east-1.amazonaws.com/test',
  authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_szwZtfXgl',
  authWellknownEndpointUrl:
    'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_szwZtfXgl',
  redirectUrl: 'http://localhost:4200/redirect',
  postLogoutRedirectUri: 'http://localhost:4200',
  clientId: '7ocqnpg4b45h239cc3p9pke5kf',
  renewTimeBeforeTokenExpiresInSeconds: 30,
  region: 'us-east-1',
  userPoolId: 'us-east-1_szwZtfXgl',
  maxImageFileSizeInBytes: 15728640,
  googleMapId: '6b0e9677f8a58360',
};
