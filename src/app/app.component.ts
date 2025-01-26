import { Component, inject, Injector } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AppStore } from './store/store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, RouterLink],
  providers: [AppStore],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'snappin-ui';

  injector = inject(Injector);
  appStore = inject(AppStore);

  constructor() {
    // this.appStore.loadMaps(void '', { injector: this.injector });
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
    const mapId = this.appStore.mapsIterable()[0].mapId;
    const markerId = this.appStore.mapsIterable()[0].markers[0].markerId;

    this.appStore.getImagesForMarker({ mapId, markerId });
  }

  updateImageForMarker() {
    const mapId = this.appStore.mapsIterable()[0].mapId;
    const markerId = this.appStore.mapsIterable()[0].markers[0].markerId;
    const imageId =
      this.appStore.mapsIterable()[0].markers[0].images[0].imageId;

    this.appStore.updateImageForMarker({
      mapId,
      markerId,
      imageId,
      data: { legend: 'bananas updated' },
    });
  }
}
