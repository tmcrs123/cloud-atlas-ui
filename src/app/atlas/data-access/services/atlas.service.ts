import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Atlas } from '../../../shared/models/atlas.model';
import { EnvironmentVariablesService } from '../../../shared/services/environment-variables.service';

@Injectable({
  providedIn: 'root',
})
export class AtlasService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentVariablesService);

  createAtlas(data: Partial<Atlas>): Observable<Atlas> {
    return this.http.post<Atlas>(this.buildApiEndpoint('atlas'), data);
  }

  loadAtlasList(): Observable<Atlas[]> {
    return this.http.get<Atlas[]>(this.buildApiEndpoint('atlas'));
  }

  deleteAtlas(atlasId: string): Observable<void> {
    return this.http.delete<void>(this.buildApiEndpoint(`atlas/${atlasId}`), { body: {} });
  }

  getAtlas(atlasId: string): Observable<Atlas> {
    return this.http.get<Atlas>('atlas/:atlasId', { params: { atlasId } });
  }

  updateAtlas(atlasId: string, data: Partial<Atlas>): Observable<Atlas> {
    return this.http.put<Atlas>(this.buildApiEndpoint(`atlas/${atlasId}`), data);
  }

  private buildApiEndpoint(path: string) {
    return `${this.env.getEnvironmentValue('api_endpoint')}/${path}`;
  };
}
