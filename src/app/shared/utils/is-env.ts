import { environment } from '../../../environments/environment';

export function isEnvironment(environmentName: string) {
  return environment.environment_name === environmentName;
}
