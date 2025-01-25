import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { buildApiEndpoint } from '../../../shared/utils';
import { Image } from '../../../shared/models/index.js';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  constructor() {}

  private readonly http = inject(HttpClient);

  public getImagesForMarker(
    mapId: string,
    markerId: string
  ): Observable<Image[]> {
    return this.http.get<Image[]>(
      buildApiEndpoint(`images/${mapId}/${markerId}/markers`)
    );
  }
}
