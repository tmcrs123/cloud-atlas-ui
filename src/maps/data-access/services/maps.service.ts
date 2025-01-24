import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import {
  finalize,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { SnappinMap } from '../../../shared/models'; // Adjust the path as necessary
import { buildApiEndpoint } from '../../../shared/utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class MapsService {
  constructor() {}

  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  createMap(data: Partial<SnappinMap>): Observable<SnappinMap> {
    return this.http.post<SnappinMap>(buildApiEndpoint('maps'), data);
  }

  loadMaps(): Observable<{ [mapId: string]: SnappinMap }> {
    return this.http.get<SnappinMap[]>(buildApiEndpoint('maps')).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((apiResponse) => {
        let loadedMaps: { [mapId: string]: SnappinMap } = {};

        apiResponse?.forEach((loadedMap) => {
          loadedMaps[loadedMap.mapId] = loadedMap;
        });
        return of(loadedMaps);
      })
    );
  }

  deleteMap(mapId: string): Observable<void> {
    return this.http
      .delete<void>(buildApiEndpoint(`maps/${mapId}`))
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  getMap(mapId: string): Observable<SnappinMap> {
    return this.http
      .get<SnappinMap>('maps/:mapId', { params: { mapId } })
      .pipe(takeUntilDestroyed());
  }

  updateMap(mapId: string, data: Partial<SnappinMap>): Observable<SnappinMap> {
    return this.http
      .put<SnappinMap>(buildApiEndpoint(`maps/${mapId}`), data)
      .pipe(finalize(() => alert('update map complete')));
  }
}
