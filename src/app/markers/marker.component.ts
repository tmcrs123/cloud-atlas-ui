import { DatePipe } from '@angular/common';
import { Component, type Signal, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { environment } from '../../environments/environment.js';
import type { Atlas } from '../shared/models/atlas.model';
import type { Marker } from '../shared/models/marker.js';
import { BannerService } from '../shared/services/banner-service.js';
import { ButtonComponent, type ButtonConfig } from '../shared/ui/button/button.component';
import { CardComponent } from '../shared/ui/card/card.component';
import { type CustomDialogConfig, DialogComponent } from '../shared/ui/dialog/dialog.component';
import { DropdownComponent, type DropdownConfig } from '../shared/ui/dropdown/dropdown.component';
import { SelectComponent } from '../shared/ui/select/select.component';
import { AppStore } from '../store/store.js';

@Component({
  selector: 'app-marker',
  imports: [ButtonComponent, CardComponent, DropdownComponent, DialogComponent, SelectComponent, ReactiveFormsModule, RouterLink],
  providers: [DatePipe],
  templateUrl: './marker.component.html',
})
export class MarkerComponent {
  //configs
  protected goToMapButtonConfig: ButtonConfig = {
    text: 'Show on map',
    type: 'secondary_action',
    svg: 'globe',
  };

  protected goToMapButtonConfigMobileBtnConfig: ButtonConfig = {
    text: '',
    type: 'primary_action',
    svg: 'plus',
    customCss: 'rounded-full bg-sky-600 text-white hover:bg-yellow-700 focus:outline-none shadow-md cursor-pointer p-3',
  };

  protected deleteMarkerMobileBtnConfig: ButtonConfig = {
    text: '',
    type: 'secondary_action',
    svg: 'trash',
    customCss: 'rounded-full bg-pink-600 text-white hover:bg-pink-700 focus:outline-none shadow-md cursor-pointer p-3',
  };

  // inject
  protected datePipe = inject(DatePipe);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected store = inject(AppStore);
  protected banner = inject(BannerService);

  //controls
  protected deleteMarkerFormControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  //signals
  protected deleteMarkerFormControlStatusChangesSignal = toSignal(this.deleteMarkerFormControl.statusChanges.pipe(startWith('INVALID')));
  protected isDeleteMarkerDialogOpen = signal(false);
  protected atlasId: string;
  protected markers: Signal<Marker[]> = signal([]);
  protected showAtlas = signal(false);
  protected canAddMarkers = computed(() => {
    return this.markers().length < Number.parseInt(environment.markersLimit);
  });
  protected deleteMarkerDialogConfig = computed<CustomDialogConfig>(() => {
    return {
      title: 'Delete marker',
      primaryActionButtonConfig: {
        text: 'Delete marker',
        type: 'delete',
        disabled: this.deleteMarkerFormControlStatusChangesSignal() === 'INVALID',
      },
      secondaryActionButtonConfig: {
        text: 'Cancel',
        type: 'cancel',
      },
    };
  });
  protected dropdownConfig = computed<DropdownConfig>(() => {
    const baseConfig: DropdownConfig = {
      options: [],
      buttonConfig: {
        text: 'Manage markers',
        type: 'primary_action',
        svg: 'arrow_down',
      },
    };
    if (this.canAddMarkers()) baseConfig.options.push({ label: 'Add marker', index: 1 });

    if (this.markers().length > 0) {
      baseConfig.options.push({ label: 'Delete marker', index: 0 });
    }

    return baseConfig;
  });

  //properties
  protected map: Atlas | undefined;

  constructor() {
    effect(() => {
      if (!this.canAddMarkers()) {
        this.banner.setMessage({ message: 'You have reached the limit of 25 markers for this map 🗻', type: 'info' });
      }
    });
  }

  ngOnInit() {
    this.atlasId = this.route.snapshot.paramMap.get('atlasId')!;
    if (!this.atlasId) throw new Error('map id not found');

    this.map = this.store.getAtlasById(this.atlasId);

    //try to fetch from store first. If no markers there ask API
    this.markers = this.store.getMarkersForAtlas(this.atlasId);
    if (!this.markers() || this.markers().length === 0) this.store.loadMarkers({ atlasId: this.atlasId });
  }

  protected fetchSelectOptions() {
    return this.markers().map((m) => ({ title: m.title, value: m.markerId }));
  }

  protected onDropdownOptionSelected(optionIndex: number) {
    if (optionIndex) {
      this.goToAtlasView('add');
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
      atlasId: this.atlasId,
      markerIds: [this.deleteMarkerFormControl.value],
    });
    this.isDeleteMarkerDialogOpen.set(false);
  }

  protected goToAtlasView(mapMode: string) {
    this.router.navigate(['world', this.atlasId], {
      queryParams: { mapMode },
    });
  }
}
