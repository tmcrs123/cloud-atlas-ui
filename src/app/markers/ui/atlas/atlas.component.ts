import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import {
  outputToObservable,
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  GoogleMap,
  GoogleMapsModule,
  MapInfoWindow,
} from '@angular/google-maps';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { iif, of, switchMap, tap } from 'rxjs';
import { Marker } from '../../../shared/models';
import {
  CustomDialogConfig,
  DialogComponent,
} from '../../../shared/ui/dialog/dialog.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import {
  ButtonComponent,
  ButtonConfig,
} from '../../../shared/ui/button/button.component';

const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  draggableCursor: 'grab',
  draggingCursor: 'grab',
  scaleControl: false,
  disableDefaultUI: true,
  scrollwheel: true,
  zoom: 5,
  mapId: '6b0e9677f8a58360',
};

const MOVE_MODE_MAP_OPTIONS: google.maps.MapOptions = {
  draggableCursor: 'grab',
  draggingCursor: 'grab',
};
const ADD_MODE_MAP_OPTIONS: google.maps.MapOptions = {
  draggableCursor: 'crosshair',
  draggingCursor: 'grab',
};

const INFO_WINDOW_OPTIONS: google.maps.InfoWindowOptions = {
  headerContent: null,
  headerDisabled: true,
};

type MapMode = 'add' | 'move' | 'loading';

type LatLong = {
  latitude: number;
  longitude: number;
};

function generateRandomCoordinates(): LatLong {
  // Latitude ranges from -90 to 90
  const latitude = (Math.random() * 180 - 90).toFixed(6);

  // Longitude ranges from -180 to 180
  const longitude = (Math.random() * 360 - 180).toFixed(6);

  return {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  };
}

@Component({
  selector: 'app-atlas',
  imports: [
    GoogleMapsModule,
    MapInfoWindow,
    RouterLink,
    DialogComponent,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
  ],
  templateUrl: './atlas.component.html',
  styles: [
    `
      :host {
        display: block;
        height: calc(100vh - 100px);
      }
    `,
  ],
})
export default class AtlasComponent {
  destroyRef = inject(DestroyRef);
  router = inject(Router);
  ar = inject(ActivatedRoute);
  protected moveButtonConfig: ButtonConfig = {
    text: 'Move around',
    type: 'primary_action',
    svg: 'globe',
  };

  goToMarker() {}

  protected addButtonConfig: ButtonConfig = {
    text: 'Add marker',
    type: 'add',
    svg: 'plus',
  };

  protected goBackButtonConfig: ButtonConfig = {
    text: 'Go back',
    type: 'secondary_action',
    svg: 'arrow_back',
  };

  protected dialogConfig: CustomDialogConfig = {
    data: {
      confirmButtonText: 'Add',
      title: 'What is the name of the new marker?',
      isDeleteDialog: false,
    },
    primaryActionButtonConfig: {
      text: 'Add marker',
      type: 'add',
    },
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };

  protected infoWindowOptions = INFO_WINDOW_OPTIONS;
  protected isDialogOpen = false;
  protected newMarkerNameFormControl = new FormControl(
    '',
    Validators.minLength(5)
  );

  dialogComponentRef = viewChild.required<DialogComponent>(DialogComponent);
  googleMapRef = viewChild.required<GoogleMap>(GoogleMap);

  protected mapMode: WritableSignal<string> = signal('loading');
  protected mapOptions = computed(() => {
    switch (this.mapMode()) {
      case 'loading':
        return {
          ...DEFAULT_MAP_OPTIONS,
          center: {
            lat: 51.4933675, //Greenwich
            lng: 0, //Greenwich
          },
        };
      case 'move':
        return {
          ...DEFAULT_MAP_OPTIONS,
          ...MOVE_MODE_MAP_OPTIONS,
          zoom: this.googleMapRef().zoom || DEFAULT_MAP_OPTIONS['zoom'],
          center: this.googleMapRef().getCenter(),
        };
      case 'add':
        return {
          ...DEFAULT_MAP_OPTIONS,
          ...ADD_MODE_MAP_OPTIONS,
          zoom: this.googleMapRef().zoom || DEFAULT_MAP_OPTIONS['zoom'],
          center: this.googleMapRef().getCenter(),
        };
      default:
        return {
          ...DEFAULT_MAP_OPTIONS,
          center: {
            lat: 51.4933675, //Greenwich
            lng: 0, //Greenwich
          },
        };
    }
  });

  /**
   *
   */
  constructor() {
    // const param = this.ar.snapshot.queryParamMap.get('mapMode');
    // this.mapMode.set(param ? (param as MapMode) : this.mapMode());
  }

  ngAfterViewInit() {
    const param = this.ar.snapshot.queryParamMap.get('mapMode');
    this.mapMode.set(param ? (param as MapMode) : this.mapMode());

    //what happens when add marker dialog is closed
    outputToObservable(this.dialogComponentRef().dialogClosed)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((complete) =>
          iif(
            () => complete,
            of(this.newMarkerNameFormControl.value),
            of(null)
          ).pipe(tap(() => this.newMarkerNameFormControl.setValue(null)))
        )
      )
      .subscribe({});
  }

  existingMarkers = input<Marker[]>(Array(5).fill({ title: 'banannas' }));

  existingAtlasMarkers = computed(() =>
    this.existingMarkers().map(
      (marker) =>
        ({
          title: marker.title,
          position: {
            lat: generateRandomCoordinates().latitude,
            lng: generateRandomCoordinates().longitude,
          },
        } as google.maps.marker.AdvancedMarkerElementOptions)
    )
  );

  onCardClick(index: number) {
    const m = this.existingAtlasMarkers()[index];
    if (!m.position?.lat && !m.position?.lng) return;
    this.googleMapRef().googleMap?.setCenter({
      lat: Number(m.position.lat),
      lng: Number(m.position.lng),
    });
  }
}
