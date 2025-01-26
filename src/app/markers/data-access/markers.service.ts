import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Marker } from '../../shared/models';
import { buildApiEndpoint } from '../../shared/utils';

@Injectable({
  providedIn: 'root',
})
export class MarkersService {
  constructor() {}

  private readonly http = inject(HttpClient);

  public createMarkers(
    mapId: string,
    data: Partial<Marker>[]
  ): Observable<Marker[]> {
    return this.http.post<Marker[]>(buildApiEndpoint(`markers/${mapId}`), {
      markers: data,
    });
  }

  public getMarkersForMap(mapId: string): Observable<Marker[]> {
    return this.http.get<Marker[]>(buildApiEndpoint(`markers/${mapId}`));
  }
  public deleteMarkers(mapId: string, markerIds: string[]): Observable<void> {
    return this.http.delete<void>(buildApiEndpoint(`markers/${mapId}`), {
      body: { markerIds },
      params: { all: 0 },
    });
  }
  public updateMarker(mapId: string, markerId: string, data: Partial<Marker>) {
    return this.http.put<Marker>(
      buildApiEndpoint(`markers/${mapId}/${markerId}`),
      data
    );
  }
}
