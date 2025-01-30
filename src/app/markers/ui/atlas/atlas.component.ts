import {
  Component,
  computed,
  DestroyRef,
  inject,
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
import { defer, map, tap } from 'rxjs';
import {
  ButtonComponent,
  ButtonConfig,
} from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import {
  CustomDialogConfig,
  DialogComponent,
} from '../../../shared/ui/dialog/dialog.component';
import { AppStore } from '../../../store/store';

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
  //#region  config
  protected moveButtonConfig: ButtonConfig = {
    text: 'Move around',
    type: 'primary_action',
    svg: 'globe',
  };

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
    isDeleteDialog: false,
    title: 'What is the name of the new marker?',
    primaryActionButtonConfig: {
      text: 'Add marker',
      type: 'add',
    },
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };

  //#endregion

  protected infoWindowOptions = INFO_WINDOW_OPTIONS;
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
  protected canOpenDialog = computed(() => this.mapMode() === 'add');

  activatedRoute = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);
  router = inject(Router);
  store = inject(AppStore);

  dialogComponentRef = viewChild.required<DialogComponent>(DialogComponent);
  googleMapRef = viewChild.required<GoogleMap>(GoogleMap);

  protected mapId: string = this.activatedRoute.snapshot.paramMap.get(
    'mapId'
  ) as string;
  protected markers = this.store.getMarkersForMap(this.mapId);
  protected newMarkerNameFormControl = new FormControl('', {
    validators: Validators.minLength(5),
    nonNullable: true,
  });
  protected isDialogOpen = false;

  readonly atlasMarkers = computed(() =>
    this.markers().map(
      (marker) =>
        ({
          title: marker.title,
          position: {
            lat: marker.coordinates.lat,
            lng: marker.coordinates.lng,
          },
        } as google.maps.marker.AdvancedMarkerElementOptions)
    )
  );

  lastLatLngClicked = signal<google.maps.LatLng | null>(null);
  lastLatLngClicked$ = defer(() =>
    this.googleMapRef().mapClick.pipe(
      takeUntilDestroyed(this.destroyRef),
      map((click) => click.latLng),
      tap((latLng) => this.lastLatLngClicked.set(latLng))
    )
  );

  //Effects
  readonly clearFormControlOnDialogClose$ = defer(() =>
    outputToObservable(this.dialogComponentRef().dialogClosed).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.newMarkerNameFormControl.setValue(''))
    )
  );

  ngAfterViewInit() {
    this.lastLatLngClicked$.subscribe();
  }

  //Actions
  protected readonly userCompletesAddDialog = (hasMarkerToCreate: boolean) => {
    if (!hasMarkerToCreate) {
      this.isDialogOpen = false;
      return;
    }

    this.store.createMarkers({
      mapId: this.mapId,
      data: [
        {
          mapId: this.mapId,
          title: this.newMarkerNameFormControl.value,
          coordinates: {
            lat: this.lastLatLngClicked()?.lat() as number,
            lng: this.lastLatLngClicked()?.lng() as number,
          },
        },
      ],
    });

    this.isDialogOpen = false;
  };

  ngOnInit() {
    // this.existingMarkers.set(this.store.getMarkersForMap(this.mapId));
    this.clearFormControlOnDialogClose$.subscribe();
  }

  onCardClick(index: number) {
    const m = this.atlasMarkers()[index];
    if (!m.position?.lat && !m.position?.lng) return;
    this.googleMapRef().googleMap?.setCenter({
      lat: Number(m.position.lat),
      lng: Number(m.position.lng),
    });
  }
}
