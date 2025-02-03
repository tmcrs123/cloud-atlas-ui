import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoogleMap, GoogleMapsModule, MapInfoWindow } from '@angular/google-maps';
import { ActivatedRoute, Router } from '@angular/router';
import { defer, map, startWith, tap } from 'rxjs';
import { SnappinMap } from '../../../shared/models';
import { ButtonComponent, ButtonConfig } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { CustomDialogConfig, DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import { AppStore } from '../../../store/store';
import { ADD_BUTTON_CONFIG, ADD_MODE_MAP_OPTIONS, DEFAULT_MAP_OPTIONS, GO_BACK_BUTTON_CONFIG, INFO_WINDOW_OPTIONS, MOVE_BUTTON_CONFIG, MOVE_MODE_MAP_OPTIONS } from './atlas.component.config';

@Component({
  selector: 'app-atlas',
  imports: [GoogleMapsModule, MapInfoWindow, DialogComponent, ReactiveFormsModule, CardComponent, ButtonComponent, CommonModule],
  providers: [DatePipe],
  templateUrl: './atlas.component.html',
  styles: [
    `
      :host {
        display: block;
        height: calc(100vh - 150px);
        padding: 2rem;
      }
    `,
  ],
})
export default class AtlasComponent {
  //config
  protected moveButtonConfig: ButtonConfig = MOVE_BUTTON_CONFIG;
  protected addButtonConfig: ButtonConfig = ADD_BUTTON_CONFIG;
  protected goBackButtonConfig: ButtonConfig = GO_BACK_BUTTON_CONFIG;
  protected infoWindowOptions = INFO_WINDOW_OPTIONS;

  //inject
  protected activatedRoute = inject(ActivatedRoute);
  protected datePipe = inject(DatePipe);
  private destroyRef = inject(DestroyRef);
  protected router = inject(Router);
  protected store = inject(AppStore);

  //properties
  protected mapId: string = this.activatedRoute.snapshot.paramMap.get('mapId') as string;
  protected mapModeQueryParam: string = this.activatedRoute.snapshot.queryParamMap.get('mapMode') as string;

  protected isDialogOpen = false;
  protected map: SnappinMap | undefined = undefined;

  //signals
  protected markers = this.store.getMarkersForMap(this.mapId);
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
          zoom: this.googleMapRef().googleMap?.getZoom() ? this.googleMapRef().googleMap?.getZoom() : DEFAULT_MAP_OPTIONS['zoom'],
          center: this.googleMapRef().getCenter(),
        };
      case 'add':
        return {
          ...DEFAULT_MAP_OPTIONS,
          ...ADD_MODE_MAP_OPTIONS,
          zoom: this.googleMapRef().googleMap?.getZoom() ? this.googleMapRef().googleMap?.getZoom() : DEFAULT_MAP_OPTIONS['zoom'],
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
  protected canOpenAddMarkerDialog = computed(() => this.mapMode() === 'add');
  protected lastLatLngClicked = signal<google.maps.LatLng | null>(null);
  protected atlasMarkers = computed(() =>
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
  protected dialogConfig = computed<CustomDialogConfig>(() => {
    return {
      title: 'What is the name of the new marker?',
      primaryActionButtonConfig: {
        text: 'Add marker',
        type: 'add',
        disabled: this.newMarkerNameFormControlStatusChangesSignal() === 'INVALID',
      },
      secondaryActionButtonConfig: {
        text: 'Cancel',
        type: 'secondary_action',
      },
    };
  });

  //VC / CC
  protected dialogComponentRef = viewChild.required<DialogComponent>(DialogComponent);
  protected googleMapRef = viewChild.required<GoogleMap>(GoogleMap);

  //Form controls
  protected newMarkerNameFormControl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  protected newMarkerNameFormControlStatusChangesSignal = toSignal(this.newMarkerNameFormControl.statusChanges.pipe(startWith('INVALID')));

  //Effects
  protected lastLatLngClicked$ = defer(() =>
    this.googleMapRef().mapClick.pipe(
      takeUntilDestroyed(this.destroyRef),
      map((click) => click.latLng),
      tap((latLng) => this.lastLatLngClicked.set(latLng))
    )
  );

  protected clearFormControlOnDialogClose$ = defer(() =>
    outputToObservable(this.dialogComponentRef().dialogClosed).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.newMarkerNameFormControl.reset())
    )
  );

  ngOnInit() {
    this.clearFormControlOnDialogClose$.subscribe();
    this.map = this.store.getMapById(this.mapId);
  }

  ngAfterViewInit() {
    this.lastLatLngClicked$.subscribe();
    this.mapMode.set(this.mapModeQueryParam); //allow enough time for google maps api to load
  }

  protected userCompletesAddDialog = (hasMarkerToCreate: boolean) => {
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

  onCardClick(index: number) {
    const m = this.atlasMarkers()[index];
    if (!m.position?.lat && !m.position?.lng) return;
    this.googleMapRef().googleMap?.setCenter({
      lat: Number(m.position.lat),
      lng: Number(m.position.lng),
    });
  }

  protected navigateToMarkerDetail(markerIndex: number) {
    this.router.navigate(['markers', this.mapId, 'marker', this.markers()[markerIndex].markerId, 'detail']);
  }
}
