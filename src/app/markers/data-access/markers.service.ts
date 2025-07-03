import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Marker } from '../../shared/models/marker';
import { EnvironmentVariablesService } from '../../shared/services/environment-variables.service';

@Injectable({
  providedIn: 'root',
})
export class MarkersService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentVariablesService);

  public createMarkers(atlasId: string, data: Partial<Marker>[]): Observable<Marker[]> {
    return this.http.post<Marker[]>(this.buildApiEndpoint(`markers/${atlasId}`), {
      markers: data,
    });
  }

  public getMarkersForAtlas(atlasId: string): Observable<Marker[]> {
    return this.http.get<Marker[]>(this.buildApiEndpoint(`markers/${atlasId}`));
  }
  public deleteMarkers(atlasId: string, markerIds: string[]): Observable<void> {
    return this.http.delete<void>(this.buildApiEndpoint(`markers/${atlasId}`), {
      body: { markerIds },
      params: { all: 0 },
    });
  }
  public updateMarker(atlasId: string, markerId: string, data: Partial<Marker>) {
    return this.http.put<Marker>(this.buildApiEndpoint(`markers/${atlasId}/${markerId}`), data);
  }

  private buildApiEndpoint(path: string) {
    return `${this.env.getEnvironmentValue('api_endpoint')}/${path}`;
  };
}
