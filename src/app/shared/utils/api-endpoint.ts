import { environment } from '../../../environments/environment.js';

export const buildApiEndpoint = (path: string) => {
  return `${environment.api_endpoint}/${path}`;
};
