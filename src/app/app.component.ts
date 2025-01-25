import { JsonPipe } from '@angular/common';
import { Component, inject, Injector } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { MapsStore } from '../maps/data-access/maps.store';
import { MarkersStore } from './markers/data-access/markers.store';
import { ImagesStore } from './images/data-access/images-store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, JsonPipe, ReactiveFormsModule],
  providers: [MapsStore],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'snappin-ui';

  injector = inject(Injector);
  mapsStore = inject(MapsStore);
  markersStore = inject(MarkersStore);
  imagesStore = inject(ImagesStore);

  constructor() {
    this.mapsStore.loadMaps(void '', { injector: this.injector });
  }

  ngOnInit() {
    console.log(this.mapsStore.mapsIterable().length);
  }

  createMarkers() {
    this.markersStore.createMarkers({
      mapId: this.mapsStore.mapsIterable()[0].mapId,
      data: Array(1).fill({
        coordinates: { lat: Math.random(), lng: Math.random() },
      }),
    });
  }

  deleteMarkers() {
    const ids = this.markersStore
      .getMarkersForMap(this.mapsStore.mapsIterable()[0].mapId)
      .map((m) => m.markerId);

    this.markersStore.deleteMarkers({
      mapId: this.mapsStore.mapsIterable()[0].mapId,
      markerIds: [ids[0], ids[1]],
    });
  }

  updateMarker() {
    const mapId = this.mapsStore.mapsIterable()[0].mapId;

    const markerId = this.markersStore
      .getMarkersForMap(this.mapsStore.mapsIterable()[0].mapId)
      .map((m) => m.markerId)[0];

    this.markersStore.updateMarker({
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

    this.imagesStore.getImagesForMarker({ mapId, markerId });
  }
}
