import { Component, inject, Signal, signal } from '@angular/core';
import { CustomDialogConfig } from '../shared/ui/dialog/dialog.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ButtonComponent,
  ButtonConfig,
} from '../shared/ui/button/button.component';
import { CardComponent } from '../shared/ui/card/card.component';
import { AppStore } from '../store/store';
import { Marker } from '../shared/models';

@Component({
  selector: 'app-marker',
  imports: [ButtonComponent, CardComponent],
  templateUrl: './marker.component.html',
})
export default class MarkerComponent {
  protected mapId: string | null = '';
  showMap = signal(false);
  route = inject(ActivatedRoute);
  router = inject(Router);
  store = inject(AppStore);
  markers: Signal<Marker[]> = signal([]);

  ngOnInit() {
    this.mapId = this.route.snapshot.paramMap.get('mapId');
    if (!this.mapId) throw new Error('map id not found');

    //try to fetch from store first. If no markers there ask API
    this.markers = this.store.getMarkersForMap(this.mapId);
    if (!this.markers() || this.markers().length === 0)
      this.store.loadMarkers({ mapId: this.mapId });
  }

  protected goToMapButtonConfig: ButtonConfig = {
    text: 'Show on map',
    type: 'primary_action',
    svg: 'globe',
  };

  protected addMarkerButtonConfig: ButtonConfig = {
    text: 'Add marker',
    type: 'add',
    svg: 'plus',
  };

  protected dialogConfig: CustomDialogConfig = {
    title: 'Delete image',
    isDeleteDialog: true,
    primaryActionButtonConfig: {
      text: 'Delete image',
      type: 'add',
    },
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };

  protected goToMap(mapMode: string) {
    this.router.navigate(['atlas', this.mapId], { queryParams: { mapMode } });
  }
}
