import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Marker } from '../../shared/models/marker';
import { buildApiEndpoint } from '../../shared/utils/api-endpoint';

@Injectable({
  providedIn: 'root',
})
export class MarkersService {
  private readonly http = inject(HttpClient);

  public createMarkers(atlasId: string, data: Partial<Marker>[]): Observable<Marker[]> {
    return this.http.post<Marker[]>(buildApiEndpoint(`markers/${atlasId}`), {
      markers: data,
    });
  }

  public getMarkersForAtlas(atlasId: string): Observable<Marker[]> {
    return this.http.get<Marker[]>(buildApiEndpoint(`markers/${atlasId}`));
  }
  public deleteMarkers(atlasId: string, markerIds: string[]): Observable<void> {
    return this.http.delete<void>(buildApiEndpoint(`markers/${atlasId}`), {
      body: { markerIds },
      params: { all: 0 },
    });
  }
  public updateMarker(atlasId: string, markerId: string, data: Partial<Marker>) {
    return this.http.put<Marker>(buildApiEndpoint(`markers/${atlasId}/${markerId}`), data);
  }
}
