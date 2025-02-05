import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, Injector, type WritableSignal, computed, inject, signal, viewChild } from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoogleMap, GoogleMapsModule, MapInfoWindow } from '@angular/google-maps';
import { ActivatedRoute, Router } from '@angular/router';
import { defer, filter, map, startWith, switchMap, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.js';
import type { Atlas } from '../../../shared/models/atlas.model.js';
import { BannerService } from '../../../shared/services/banner-service.js';
import { ButtonComponent, type ButtonConfig } from '../../../shared/ui/button/button.component.js';
import { CardComponent } from '../../../shared/ui/card/card.component.js';
import { type CustomDialogConfig, DialogComponent } from '../../../shared/ui/dialog/dialog.component.js';
import { AppStore } from '../../../store/store.js';
import { ADD_BUTTON_CONFIG, ADD_MODE_MAP_OPTIONS, DEFAULT_MAP_OPTIONS, GO_BACK_BUTTON_CONFIG, INFO_WINDOW_OPTIONS, MOVE_BUTTON_CONFIG, MOVE_MODE_MAP_OPTIONS } from './world-map.component.config.js';

@Component({
  selector: 'app-atlas',
  imports: [GoogleMapsModule, MapInfoWindow, DialogComponent, ReactiveFormsModule, CardComponent, ButtonComponent, CommonModule],
  providers: [DatePipe],
  templateUrl: './world-map.component.html',
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
export class WorldMapComponent {
  //config
  protected goBackButtonConfig: ButtonConfig = GO_BACK_BUTTON_CONFIG;
  protected infoWindowOptions = INFO_WINDOW_OPTIONS;

  //inject
  protected activatedRoute = inject(ActivatedRoute);
  protected banner = inject(BannerService);
  protected datePipe = inject(DatePipe);
  private destroyRef = inject(DestroyRef);
  protected router = inject(Router);
  protected store = inject(AppStore);
  protected injector = inject(Injector);

  //properties
  protected atlasId: string = this.activatedRoute.snapshot.paramMap.get('atlasId') as string;
  protected mapModeQueryParam: string = this.activatedRoute.snapshot.queryParamMap.get('mapMode') as string;

  protected isDialogOpen = false;
  protected atlas: Atlas | undefined = undefined;

  //signals
  protected markers = this.store.getMarkersForAtlas(this.atlasId);
  protected mapMode: WritableSignal<string> = signal('loading');
  protected addButtonConfig = signal(ADD_BUTTON_CONFIG);
  protected moveButtonConfig = signal(MOVE_BUTTON_CONFIG);
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
          zoom: this.googleMapRef().googleMap?.getZoom() ? this.googleMapRef().googleMap?.getZoom() : DEFAULT_MAP_OPTIONS.zoom,
          center: this.googleMapRef().getCenter(),
        };
      case 'add':
        return {
          ...DEFAULT_MAP_OPTIONS,
          ...ADD_MODE_MAP_OPTIONS,
          zoom: this.googleMapRef().googleMap?.getZoom() ? this.googleMapRef().googleMap?.getZoom() : DEFAULT_MAP_OPTIONS.zoom,
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
  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
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
          // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
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

  //bit weird but this is essentially reacting to
  //changes in the number of markers. The goal is to disable the buttons
  // Had to do it like this because google api complains about setting map modes while it's loading
  protected markersLimitReached$ = defer(() =>
    this.googleMapRef().idle.pipe(
      take(1),
      switchMap(() => toObservable(this.markers, { injector: this.injector })),
      filter((markers) => markers.length >= environment.markersLimit),
      tap(() => {
        this.mapMode.set('move');
        this.addButtonConfig.update((state) => ({ ...state, disabled: true }));
        this.banner.setMessage({ message: 'You have reached the limit of 25 markers for this map 🗻', type: 'info' });
      })
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
    this.atlas = this.store.getAtlasById(this.atlasId);
  }

  ngAfterViewInit() {
    this.lastLatLngClicked$.subscribe();
    this.markersLimitReached$.subscribe();
    this.mapMode.set(this.mapModeQueryParam); //allow enough time for google maps api to load
  }

  protected userCompletesAddDialog = (hasMarkerToCreate: boolean) => {
    if (!hasMarkerToCreate) {
      this.isDialogOpen = false;
      return;
    }

    this.store.createMarkers({
      atlasId: this.atlasId,
      data: [
        {
          atlasId: this.atlasId,
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
    this.router.navigate(['markers', this.atlasId, 'marker', this.markers()[markerIndex].markerId, 'detail']);
  }
}
