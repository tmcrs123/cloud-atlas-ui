import { environment } from '../../environments/environment';

export const buildApiEndpoint = (path: string) => {
  return `${environment.api_endpoint}/${path}`;
};
