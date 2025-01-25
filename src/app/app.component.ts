import { JsonPipe } from '@angular/common';
import { Component, inject, Injector } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { AppStore } from '../maps/data-access/maps.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, JsonPipe, ReactiveFormsModule],
  providers: [AppStore],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'snappin-ui';

  injector = inject(Injector);
  appStore = inject(AppStore);

  constructor() {
    this.appStore.loadMaps(void '', { injector: this.injector });
  }

  ngOnInit() {
    console.log(this.appStore.mapsIterable().length);
  }

  createMarkers() {
    this.appStore.createMarkers({
      mapId: this.appStore.mapsIterable()[0].mapId,
      data: Array(1).fill({
        coordinates: { lat: Math.random(), lng: Math.random() },
      }),
    });
  }

  deleteMarkers() {
    const ids = this.appStore
      .getMarkersForMap(this.appStore.mapsIterable()[0].mapId)
      .map((m) => m.markerId);

    this.appStore.deleteMarkers({
      mapId: this.appStore.mapsIterable()[0].mapId,
      markerIds: [
        this.appStore.mapsIterable()[0].markers[0].markerId,
        this.appStore.mapsIterable()[0].markers[1].markerId,
      ],
    });
  }

  updateMarker() {
    const mapId = this.appStore.mapsIterable()[0].mapId;

    const markerId = this.appStore
      .getMarkersForMap(this.appStore.mapsIterable()[0].mapId)
      .map((m) => m.markerId)[0];

    this.appStore.updateMarker({
      mapId,
      markerId,
      data: {
        journal: 'Updated journal',
        title: 'Updated title',
        coordinates: { lat: 0, lng: 0 },
      },
    });
  }

  getImagesForMarker() {
    const mapId = 'd8a150cd-f253-4bef-93b4-4fac401e9052';

    const markerId = '1d0532bd-6c42-4437-9083-7f66b8c76b51';

    this.appStore.getImagesForMarker({ mapId, markerId });
  }
}
