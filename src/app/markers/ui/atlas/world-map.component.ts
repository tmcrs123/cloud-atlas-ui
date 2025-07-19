import { CommonModule, DatePipe } from '@angular/common'
import { Component, DestroyRef, Injector, type WritableSignal, computed, effect, inject, signal, viewChild } from '@angular/core'
import { outputToObservable, takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { GoogleMap, GoogleMapsModule, MapGeocoder, MapInfoWindow } from '@angular/google-maps'
import { ActivatedRoute, Router } from '@angular/router'
import { debounceTime, defer, distinctUntilChanged, filter, map, startWith, switchMap, take, tap } from 'rxjs'
import { environment } from '../../../../environments/environment'
import type { Atlas } from '../../../shared/models/atlas.model'
import { BannerService } from '../../../shared/services/banner-service'
import { ButtonComponent, type ButtonConfig } from '../../../shared/ui/button/button.component'
import { CardComponent } from '../../../shared/ui/card/card.component'
import { type CustomDialogConfig, DialogComponent } from '../../../shared/ui/dialog/dialog.component'
import { AppStore, type MapOptions } from '../../../store/store'
import { ADD_BUTTON_CONFIG, GO_BACK_BUTTON_CONFIG, GO_BACK_MOBILE_BUTTON_CONFIG, INFO_WINDOW_OPTIONS, MOVE_BUTTON_CONFIG } from './world-map.component.config'

type MapMode = 'loading' | 'add' | 'move'

@Component({
  selector: "app-world-map",
  imports: [
    GoogleMapsModule,
    MapInfoWindow,
    DialogComponent,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    CommonModule,
  ],
  providers: [DatePipe],
  templateUrl: "./world-map.component.html",
  styles: [
    `
      :host {
        height: 100%;
        display: block;
      }

      @media only screen and (min-width: 500px) {
        :host {
          padding: 3rem;
        }
      }
    `,
  ],
})
export class WorldMapComponent {
  //config
  protected goBackButtonConfig: ButtonConfig = GO_BACK_BUTTON_CONFIG
  protected goBackMobileButtonConfig: ButtonConfig = GO_BACK_MOBILE_BUTTON_CONFIG
  protected infoWindowOptions = INFO_WINDOW_OPTIONS

  //inject
  protected activatedRoute = inject(ActivatedRoute)
  protected banner = inject(BannerService)
  protected datePipe = inject(DatePipe)
  private destroyRef = inject(DestroyRef)
  protected router = inject(Router)
  protected store = inject(AppStore)
  protected injector = inject(Injector)

  //properties
  protected atlas: Atlas | undefined = undefined
  protected atlasId: string = this.activatedRoute.snapshot.paramMap.get('atlasId') as string
  protected isDialogOpen = false
  protected mapModeQueryParam: MapMode = this.activatedRoute.snapshot.queryParamMap.get('mapMode') as MapMode
  protected geocoder = new MapGeocoder()

  //FormControls
  protected searchFormControl = new FormControl<string>('')

  //VC / CC
  protected dialogComponentRef = viewChild.required<DialogComponent>(DialogComponent)
  protected googleMapRef = viewChild.required<GoogleMap>(GoogleMap)

  //signals
  protected markers = this.store.getMarkersForAtlas(this.atlasId)
  protected mapMode: WritableSignal<MapMode> = signal('loading')
  protected addButtonConfig = signal(ADD_BUTTON_CONFIG)
  protected moveButtonConfig = signal(MOVE_BUTTON_CONFIG)
  protected mapOptions = this.store.worldMapState()
  protected canOpenAddMarkerDialog = computed(() => this.mapMode() === 'add')
  protected lastLatLngClicked = signal<google.maps.LatLng | null>(null)
  protected atlasMarkers = computed(() =>
    this.markers().map(
      (marker) =>
        ({
          title: marker.title,
          position: {
            lat: marker.latitude,
            lng: marker.longitude,
          },
        }) as google.maps.marker.AdvancedMarkerElementOptions,
    ),
  )
  protected dialogConfig = computed<CustomDialogConfig>(() => {
    return {
      title: 'What is the name of the new marker?',
      primaryActionButtonConfig: {
        text: 'Add marker',
        type: 'primary_action',
        disabled: this.newMarkerNameFormControlStatusChangesSignal() === 'INVALID',
      },
      secondaryActionButtonConfig: {
        text: 'Cancel',
        type: 'secondary_action',
      },
    }
  })

  //Form controls
  protected newMarkerNameFormControl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  })
  protected newMarkerNameFormControlStatusChangesSignal = toSignal(this.newMarkerNameFormControl.statusChanges.pipe(startWith('INVALID')))

  //Effects
  protected lastLatLngClicked$ = defer(() =>
    this.googleMapRef().mapClick.pipe(
      takeUntilDestroyed(this.destroyRef),
      map((click) => click.latLng),
      tap((latLng) => this.lastLatLngClicked.set(latLng)),
    ),
  )

  protected onMapLoaded$ = defer(() =>
    this.googleMapRef().idle.pipe(
      take(1),
      filter(() => this.markers().length > 0),
      tap(() => {
        this.googleMapRef().googleMap?.setZoom(this.store.worldMapState().zoom!)
        this.googleMapRef().googleMap?.setCenter(this.store.worldMapState().center!)
      }),
    ),
  )

  //bit weird but this is essentially reacting to
  //changes in the number of markers. The goal is to disable the buttons
  // Had to do it like this because google api complains about setting map modes while it's loading
  protected markersLimitReached$ = defer(() =>
    this.googleMapRef().idle.pipe(
      take(1),
      switchMap(() => toObservable(this.markers, { injector: this.injector })),
      filter((markers) => markers.length >= Number.parseInt(environment.markersLimit)),
      tap(() => {
        this.mapMode.set('move')
        this.addButtonConfig.update((state) => ({ ...state, disabled: true }))
        this.banner.setMessage({
          message: 'You have reached the limit of 25 markers for this map 🗻',
          type: 'info',
        })
      }),
    ),
  )

  protected clearFormControlOnDialogClose$ = defer(() =>
    outputToObservable(this.dialogComponentRef().dialogClosed).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.newMarkerNameFormControl.reset()),
    ),
  )

  constructor() {
    effect(() => {
      if (this.mapMode() === 'add') {
        this.googleMapRef().googleMap?.setOptions({ draggableCursor: 'crosshair', draggingCursor: 'crosshair' })
      } else if (this.mapMode() === 'move') {
        this.googleMapRef().googleMap?.setOptions({ draggableCursor: 'grab', draggingCursor: 'grab' })
      }
    })
  }

  ngOnInit() {
    this.clearFormControlOnDialogClose$.subscribe()
    this.atlas = this.store.getAtlasById(this.atlasId)
    this.onSearchTermChanged()
  }

  ngAfterViewInit() {
    this.lastLatLngClicked$.subscribe()
    this.markersLimitReached$.subscribe()
    this.onMapLoaded$.subscribe()
    this.mapMode.set(this.mapModeQueryParam) //allow enough time for google maps api to load
  }

  ngOnDestroy() {
    this.store.setWorldMapState({
      ...this.mapOptions,
      zoom: this.googleMapRef().getZoom() as number,
      center: {
        lat: this.googleMapRef().googleMap?.getCenter()?.lat() as number,
        lng: this.googleMapRef().googleMap?.getCenter()?.lng() as number,
      },
    })
  }

  protected userCompletesAddDialog = (hasMarkerToCreate: boolean) => {
    if (!hasMarkerToCreate) {
      this.isDialogOpen = false
      return
    }

    this.store.createMarkers({
      atlasId: this.atlasId,
      data: [
        {
          atlasId: this.atlasId,
          title: this.newMarkerNameFormControl.value,
          latitude: this.lastLatLngClicked()?.lat() as number,
          longitude: this.lastLatLngClicked()?.lng() as number,
        },
      ],
    })

    this.isDialogOpen = false
  }

  protected onCardClick(index: number) {
    const m = this.atlasMarkers()[index]
    if (!m.position?.lat && !m.position?.lng) return
    this.googleMapRef().googleMap?.setCenter({
      lat: Number(m.position.lat),
      lng: Number(m.position.lng),
    })
  }

  protected navigateToMarkerDetail(markerIndex: number) {
    const markerId = this.markers()[markerIndex].id
    this.router.navigate(['markers', this.atlasId, 'marker', markerId, 'detail'])
  }

  protected onSearchTermChanged() {
    this.searchFormControl.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        filter((query) => !!query),
        switchMap((query) => {
          return this.geocoder.geocode({ address: query })
        }),
      )
      .subscribe({
        next: (geocoderResponse) => {
          if (geocoderResponse.results.length === 0) return
          const res = geocoderResponse.results[0]
          this.googleMapRef().googleMap?.setCenter(res.geometry.location)
          this.googleMapRef().googleMap?.setZoom(15)
        },
      })
  }
}
