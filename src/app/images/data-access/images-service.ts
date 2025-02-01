import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { buildApiEndpoint } from '../../shared/utils';
import { Image } from '../../shared/models/index.js';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

  public updateImageForMarker(data: Partial<Image>): Observable<Image> {
    return this.http.post<Image>(
      buildApiEndpoint(`images/${data.mapId}/${data.imageId}`),
      data
    );
  }

  public deleteImageFromMarker(
    mapId: string,
    markerId: string,
    imageId: string
  ): Observable<void> {
    return this.http.delete<void>(
      buildApiEndpoint(`images/${mapId}/${markerId}/${imageId}`)
    );
  }

  public createPresignedURL(
    mapId: string,
    markerId: string
  ): Observable<{ url: string; fields: { [field: string]: string } }> {
    return this.http.get<{ url: string; fields: { [field: string]: string } }>(
      buildApiEndpoint(`images/${mapId}/${markerId}`)
    );
  }

  public pushToS3Bucket(presignedUrl: string, formData: FormData) {
    if (environment.name === 'development') {
      return this.http.post<Image>(presignedUrl, null);
    } else {
      return this.http.post(presignedUrl, formData);
    }
  }
}
