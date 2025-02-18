import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, expand, last, of, switchMap, takeWhile, timer } from 'rxjs';
import { MarkerImage } from '../../app/shared/models/marker-image';

@Injectable({
  providedIn: 'root',
})
export class ImagesServiceMock {
  private mock: MarkerImage = {
    atlasId: '12312',
    url: 'whatever.com',
    markerId: '234ger',
    imageId: 'gerg3242'
  }
  public getImagesForMarker(atlasId: string, markerId: string): Observable<MarkerImage[]> {

    return of([this.mock])
  }

  public updateImageForMarker(data: Partial<MarkerImage>): Observable<MarkerImage> {
    return of(this.mock)
  }

  public deleteImageFromMarker(atlasId: string, markerId: string, imageId: string): Observable<void> { return of() }

  public createPresignedURL(atlasId: string, markerId: string): Observable<{ url: string; fields: { [field: string]: string } }> {
    return of({ url: 'whatever', fields: {} })
  }

  public pushToS3Bucket(presignedUrl: string, formData: FormData) { }

  public poolForMarkerImages(atlasId: string, markerId: string, requiredCount: number): Observable<MarkerImage[]> {
    return of([this.mock])
  }
}
