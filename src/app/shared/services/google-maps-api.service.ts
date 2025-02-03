import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, from, switchMap, take, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  constructor() {}

  private http = inject(HttpClient);
  private apiLoaded = false;

  public loadGoogleMapsScript(): void {
    if (!this.apiLoaded) {
      const googleMapsLib = this.http.jsonp(`https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`, 'callback');

      googleMapsLib
        .pipe(
          take(1),
          switchMap(() => forkJoin([from(google.maps.importLibrary('marker'))])),
          tap(() => (this.apiLoaded = true))
        )
        .subscribe();
    }
  }
}
