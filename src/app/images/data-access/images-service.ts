import {
  HttpClient,
  HttpContext,
  HttpContextToken,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MarkerImage } from '../../shared/models/index.js';
import { buildApiEndpoint } from '../../shared/utils';
import { ERROR_MESSAGE } from '../../shared/tokens';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  constructor() {}

  private readonly http = inject(HttpClient);

  public getImagesForMarker(
    mapId: string,
    markerId: string
  ): Observable<MarkerImage[]> {
    return this.http.get<MarkerImage[]>(
      buildApiEndpoint(`images/${mapId}/${markerId}/markers`)
    );
  }

  public updateImageForMarker(
    data: Partial<MarkerImage>
  ): Observable<MarkerImage> {
    return this.http.post<MarkerImage>(
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
    let context = new HttpContext().set(
      ERROR_MESSAGE,
      'Failed to save images 🔥'
    );

    if (environment.name === 'development') {
      return this.http.post<MarkerImage>(presignedUrl, null, { context });
    } else {
      return this.http.post(presignedUrl, formData, { context });
    }
  }
}
