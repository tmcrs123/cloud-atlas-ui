import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Marker } from "../../app/shared/models/marker";

@Injectable({
  providedIn: 'root',
})
export class MarkersServiceMock {

  private marker: Marker = {
    id: "1231",
    atlasId: "42",
    createdAt: "1231231",
    imageCount: 1,
    title: "Bananas",
    coordinates: {
      longitude: 0,
      latitude: 0
    },
    images: []
  }

  public createMarkers(atlasId: string, data: Partial<Marker>[]): Observable<Marker[]> {
    return of([this.marker])
  }

  public getMarkersForAtlas(atlasId: string): Observable<Marker[]> {
    return of([this.marker])
  }
  public deleteMarkers(atlasId: string, markerIds: string[]): Observable<void> { return of() }

  public updateMarker(atlasId: string, markerId: string, data: Partial<Marker>) {
    return of([this.marker])
  }
}
