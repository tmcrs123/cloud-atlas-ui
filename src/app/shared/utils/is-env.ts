import { environment } from '../../../environments/environment.js';

export function isEnvironment(environmentName: string) {
  return environment.environmentName === environmentName;
}
