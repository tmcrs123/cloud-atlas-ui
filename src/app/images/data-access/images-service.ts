import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, expand, last, of, switchMap, takeWhile, timer } from 'rxjs';
import type { MarkerImage } from '../../shared/models/marker-image';
import { BYPASS_LOADER, ERROR_MESSAGE } from '../../shared/tokens/tokens';
import { buildApiEndpoint } from '../../shared/utils/api-endpoint';
import { isEnvironment } from '../../shared/utils/is-env';

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
    return this.http.delete<void>(buildApiEndpoint(`images/${atlasId}/${markerId}/${imageId}`), { body: {} });
  }

  public createPresignedURL(atlasId: string, markerId: string): Observable<{ url: string; fields: { [field: string]: string } }> {
    return this.http.get<{ url: string; fields: { [field: string]: string } }>(buildApiEndpoint(`images/${atlasId}/${markerId}`));
  }

  public pushToS3Bucket(presignedUrl: string, formData: FormData) {
    const context = new HttpContext().set(ERROR_MESSAGE, 'Failed to save images 🔥');

    return this.http.post<MarkerImage>(presignedUrl, isEnvironment('local') ? null : formData, { context });
  }

  public poolForMarkerImages(atlasId: string, markerId: string, requiredCount: number): Observable<MarkerImage[]> {
    let retries = 0;
    const maxRetries = 2;
    return this.http.get<MarkerImage[]>(buildApiEndpoint(`images/${atlasId}/${markerId}/markers`), { context: new HttpContext().set(BYPASS_LOADER, true) }).pipe(
      expand((response: MarkerImage[]) => {
        if (response.length === requiredCount) {
          return of(response);
        }
        retries += 1;
        return timer(5000).pipe(switchMap(() => this.http.get<MarkerImage[]>(buildApiEndpoint(`images/${atlasId}/${markerId}/markers`), { context: new HttpContext().set(BYPASS_LOADER, true) })));
      }),
      takeWhile((response) => retries !== maxRetries && response.length !== requiredCount, true),
      last()
    );
  }
}
