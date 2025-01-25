import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { SnappinMap } from '../../../shared/models';
import { buildApiEndpoint } from '../../../shared/utils';

@Injectable({
  providedIn: 'root',
})
export class MapsService {
  constructor() {}

  private readonly http = inject(HttpClient);

  createMap(data: Partial<SnappinMap>): Observable<SnappinMap> {
    return this.http.post<SnappinMap>(buildApiEndpoint('maps'), data);
  }

  loadMaps(): Observable<SnappinMap[]> {
    return this.http.get<SnappinMap[]>(buildApiEndpoint('maps'));
  }

  deleteMap(mapId: string): Observable<void> {
    return this.http.delete<void>(buildApiEndpoint(`maps/${mapId}`));
  }

  getMap(mapId: string): Observable<SnappinMap> {
    return this.http.get<SnappinMap>('maps/:mapId', { params: { mapId } });
  }

  updateMap(mapId: string, data: Partial<SnappinMap>): Observable<SnappinMap> {
    return this.http.put<SnappinMap>(buildApiEndpoint(`maps/${mapId}`), data);
  }
}
