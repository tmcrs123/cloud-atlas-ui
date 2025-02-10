function generateEnvironment() {
  const fs = require("fs");
  const fileName = "environment.ts";

  const content = `export const environment = {
    environmentName:${process.env.environmentName},
    appName:${process.env.appName},
    api_endpoint:${process.env.api_endpoint},
    authority:${process.env.authority},
    authWellknownEndpointUrl:${process.env.authWellknownEndpointUrl},
    redirectUrl:${process.env.redirectUrl},
    postLogoutRedirectUri:${process.env.postLogoutRedirectUri},
    clientId:${process.env.clientId},
    renewTimeBeforeTokenExpiresInSeconds:${process.env.renewTimeBeforeTokenExpiresInSeconds},
    region:${process.env.region},
    userPoolId:${process.env.userPoolId},
    maxImageFileSizeInBytes:${process.env.maxImageFileSizeInBytes},
    googleMapId:${process.env.googleMapId},
    googleMapsApiKey:${process.env.googleMapsApiKey},
    idTokenExpirationInMiliseconds:${process.env.idTokenExpirationInMiliseconds},
    logoutUri:${process.env.logoutUri},
    mapsLimit:${process.env.mapsLimit},
    markersLimit:${process.env.markersLimit},
    };`;

  process.chdir("src/environments");

  fs.writeFile(fileName, content, (err) => {
    err ? console.log(err) : console.log("environment generated:", content);
  });
}

generateEnvironment();
