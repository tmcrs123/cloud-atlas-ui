import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { ERROR_MESSAGE } from '../../shared/tokens/tokens.js';
import { buildApiEndpoint } from '../../shared/utils/api-endpoint.js';
import type { MarkerImage } from '../../shared/models/marker-image.js';
import { isEnvironment } from '../../shared/utils/is-env.js';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  private readonly http = inject(HttpClient);

  public getImagesForMarker(atlasId: string, markerId: string): Observable<MarkerImage[]> {
    return this.http.get<MarkerImage[]>(buildApiEndpoint(`images/${atlasId}/${markerId}/markers`));
  }

  public updateImageForMarker(data: Partial<MarkerImage>): Observable<MarkerImage> {
    return this.http.post<MarkerImage>(buildApiEndpoint(`images/${data.atlasId}/${data.imageId}`), data);
  }

  public deleteImageFromMarker(atlasId: string, markerId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(buildApiEndpoint(`images/${atlasId}/${markerId}/${imageId}`));
  }

  public createPresignedURL(atlasId: string, markerId: string): Observable<{ url: string; fields: { [field: string]: string } }> {
    return this.http.get<{ url: string; fields: { [field: string]: string } }>(buildApiEndpoint(`images/${atlasId}/${markerId}`));
  }

  public pushToS3Bucket(presignedUrl: string, formData: FormData) {
    const context = new HttpContext().set(ERROR_MESSAGE, 'Failed to save images 🔥');

    return this.http.post<MarkerImage>(presignedUrl, isEnvironment('local') ? null : formData, { context });
  }
}
