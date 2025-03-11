import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AwsRum, AwsRumConfig } from 'aws-rum-web';
import { environment } from './environments/environment';


if (environment.environmentName === 'production') {
  try {
    const config: AwsRumConfig = {
      signing: false,
      sessionSampleRate: 1,
      identityPoolId: "us-east-1:1491599b-94ad-493b-badd-2d994c74ce69",
      endpoint: "https://dataplane.rum.us-east-1.amazonaws.com",
      telemetries: ["performance", "errors", "http"],
      allowCookies: true,
      enableXRay: false
    };

    const APPLICATION_ID: string = '9f5bef11-75c7-411f-8421-5f488812d16a';
    const APPLICATION_VERSION: string = '1.0.0';
    const APPLICATION_REGION: string = 'us-east-1';

    const awsRum: AwsRum = new AwsRum(
      APPLICATION_ID,
      APPLICATION_VERSION,
      APPLICATION_REGION,
      config
    );
  } catch (error) {
    // Ignore errors thrown during CloudWatch RUM web client initialization
  }
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
