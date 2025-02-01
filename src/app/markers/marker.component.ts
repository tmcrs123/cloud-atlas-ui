import { Component, computed, inject, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Marker, SnappinMap } from '../shared/models';
import {
  ButtonComponent,
  ButtonConfig,
} from '../shared/ui/button/button.component';
import { CardComponent } from '../shared/ui/card/card.component';
import {
  CustomDialogConfig,
  DialogComponent,
} from '../shared/ui/dialog/dialog.component';
import DropdownComponent, {
  DropdownConfig,
} from '../shared/ui/dropdown/dropdown.component';
import SelectComponent from '../shared/ui/select/select.component';
import { AppStore } from '../store/store';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-marker',
  imports: [
    ButtonComponent,
    CardComponent,
    DropdownComponent,
    DialogComponent,
    SelectComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './marker.component.html',
})
export default class MarkerComponent {
  protected mapId: string;
  showMap = signal(false);
  route = inject(ActivatedRoute);
  router = inject(Router);
  store = inject(AppStore);
  markers: Signal<Marker[]> = signal([]);
  map: SnappinMap | undefined;
  isDeleteMarkerDialogOpen = signal(false);
  protected deleteMarkerFormControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  protected deleteMarkerFormControlStatusChangesSignal = toSignal(
    this.deleteMarkerFormControl.statusChanges.pipe(startWith('INVALID'))
  );

  protected deleteMarkerDialogConfig = computed<CustomDialogConfig>(() => {
    return {
      title: 'Delete marker',
      primaryActionButtonConfig: {
        text: 'Delete marker',
        type: 'delete',
        disabled:
          this.deleteMarkerFormControlStatusChangesSignal() === 'INVALID',
      },
      secondaryActionButtonConfig: {
        text: 'Cancel',
        type: 'secondary_action',
      },
    };
  });

  protected dropdownConfig = computed<DropdownConfig>(() => {
    const baseConfig: DropdownConfig = {
      options: [{ label: 'Add marker', index: 1 }],
      buttonConfig: {
        text: 'Add Or Delete',
        type: 'primary_action',
        svg: 'arrow_down',
      },
    };

    if (this.markers().length > 0) {
      baseConfig.options.push({ label: 'Delete marker', index: 0 });
    }

    return baseConfig;
  });

  ngOnInit() {
    this.mapId = this.route.snapshot.paramMap.get('mapId')!;
    if (!this.mapId) throw new Error('map id not found');

    this.map = this.store.getMapById(this.mapId);

    //try to fetch from store first. If no markers there ask API
    this.markers = this.store.getMarkersForMap(this.mapId);
    if (!this.markers() || this.markers().length === 0)
      this.store.loadMarkers({ mapId: this.mapId });
  }

  protected goToMapButtonConfig: ButtonConfig = {
    text: 'Show on map',
    type: 'add',
    svg: 'globe',
  };

  fetchSelectOptions() {
    return this.markers().map((m) => ({ title: m.title, value: m.markerId }));
  }

  protected onDropdownOptionSelected(optionIndex: number) {
    if (optionIndex) {
      this.goToMap('add');
      return;
    }
    this.isDeleteMarkerDialogOpen.set(true);
  }

  protected onDeleteMarkerDialogClosed(hasMarkerToDelete: boolean) {
    if (!hasMarkerToDelete) {
      this.isDeleteMarkerDialogOpen.set(false);

      return;
    }

    this.store.deleteMarkers({
      mapId: this.mapId,
      markerIds: [this.deleteMarkerFormControl.value],
    });
    this.isDeleteMarkerDialogOpen.set(false);
  }

  protected goToMap(mapMode: string) {
    this.router.navigate(['atlas', this.mapId], {
      queryParams: { mapMode },
    });
  }
}
