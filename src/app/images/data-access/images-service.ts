import { HttpClient, HttpContext, HttpParamsOptions } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, expand, last, of, switchMap, takeWhile, timer } from 'rxjs';
import type { MarkerImage } from '../../shared/models/marker-image';
import { EnvironmentVariablesService } from '../../shared/services/environment-variables.service';
import { BYPASS_LOADER, ERROR_MESSAGE } from '../../shared/tokens/tokens';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentVariablesService);

  public getImagesForMarker(atlasId: string, markerId: string, context?: HttpContext): Observable<MarkerImage[]> {
    return this.http.get<MarkerImage[]>(this.buildApiEndpoint(`photos`), {params: {atlasId, markerId}, context})
  }

  public updateImageForMarker(data: Partial<MarkerImage>): Observable<MarkerImage> {
    return this.http.put<MarkerImage>(this.buildApiEndpoint(`photos`), {atlasId: data.atlasId, markerId: data.markerId, photoData: { legend: data.legend, id: data.id}});
  }

  public deleteImageFromMarker(atlasId: string, markerId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(this.buildApiEndpoint('photos'), { body: { atlasId, markerId, photoId: imageId} });
  }

  public createPresignedURL(atlasId: string, markerId: string, filename: string): Observable<string> {
    return this.http.post<string>(this.buildApiEndpoint('photos/presigned-url'), { atlasId, markerId, filename });
  }

  public pushToS3Bucket(presignedUrl: string, file: File) {
    const context = new HttpContext().set(ERROR_MESSAGE, 'Failed to save images 🔥');

    return this.http.put<MarkerImage>(presignedUrl, file, { context, headers: { "Content-Type": file.type} });
  }

  public poolForMarkerImages(atlasId: string, markerId: string, requiredCount: number): Observable<MarkerImage[]> {
    let retries = 0;
    const maxRetries = 2;
    return this.getImagesForMarker(atlasId, markerId, new HttpContext().set(BYPASS_LOADER, true)).pipe(
      expand((response: MarkerImage[]) => {
        if (response.length === requiredCount) {
          return of(response);
        }
        retries += 1;
        return timer(5000).pipe(switchMap(() => this.getImagesForMarker(atlasId, markerId, new HttpContext().set(BYPASS_LOADER, true))));
      }),
      takeWhile((response) => retries !== maxRetries && response.length !== requiredCount, true),
      last()
    );
  }

  private buildApiEndpoint(path: string) {
    return `${this.env.getEnvironmentValue('api_endpoint')}/${path}`;
  };
}
