function generateEnvironment() {
  const fs = require("fs");
  const fileName = "environment.ts";

  const content = `export const environment = {
    environment_name:"${process.env.environment_name}",
    app_name:"${process.env.app_name}",
    api_endpoint:"${process.env.api_endpoint}",
    authority:"${process.env.authority}",
    auth_well_known_endpoint_url:"${process.env.auth_well_known_endpoint_url}",
    redirect_url:"${process.env.redirect_url}",
    post_logout_redirect_uri:"${process.env.post_logout_redirect_uri}",
    client_id:"${process.env.client_id}",
    renew_time_before_token_expires_in_seconds:"${process.env.renew_time_before_token_expires_in_seconds}",
    region:"${process.env.region}",
    user_pool_id:"${process.env.user_pool_id}",
    max_image_file_size_in_bytes:"${process.env.max_image_file_size_in_bytes}",
    google_map_id:"${process.env.google_map_id}",
    google_maps_api_key:"${process.env.google_maps_api_key}",
    id_token_expiration_in_miliseconds:"${process.env.id_token_expiration_in_miliseconds}",
    logout_uri:"${process.env.logout_uri}",
    maps_limit:"${process.env.maps_limit}",
    markers_limit:"${process.env.markers_limit}",
    images_limit:"${process.env.images_limit}",
    };`;

  process.chdir("src/environments");

  fs.writeFile(fileName, content, (err) => {
    err ? console.log(err) : console.log("environment generated:", content);
  });
}

generateEnvironment();
