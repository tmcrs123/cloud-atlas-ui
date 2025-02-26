import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { buildApiEndpoint } from '../../../shared/utils/api-endpoint';
import type { Atlas } from '../../../shared/models/atlas.model';

@Injectable({
  providedIn: 'root',
})
export class AtlasService {
  private readonly http = inject(HttpClient);

  createAtlas(data: Partial<Atlas>): Observable<Atlas> {
    return this.http.post<Atlas>(buildApiEndpoint('atlas'), data);
  }

  loadAtlasList(): Observable<Atlas[]> {
    return this.http.get<Atlas[]>(buildApiEndpoint('atlas'));
  }

  deleteAtlas(atlasId: string): Observable<void> {
    return this.http.delete<void>(buildApiEndpoint(`atlas/${atlasId}`), { body: {} });
  }

  getAtlas(atlasId: string): Observable<Atlas> {
    return this.http.get<Atlas>('atlas/:atlasId', { params: { atlasId } });
  }

  updateAtlas(atlasId: string, data: Partial<Atlas>): Observable<Atlas> {
    return this.http.put<Atlas>(buildApiEndpoint(`atlas/${atlasId}`), data);
  }
}
