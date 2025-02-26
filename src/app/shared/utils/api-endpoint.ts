import { environment } from '../../../environments/environment';

export function buildApiEndpoint(path: string) {
  return `${environment.api_endpoint}/${path}`;
};
