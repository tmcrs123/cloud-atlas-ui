import { type Signal, computed, inject } from '@angular/core'
import { tapResponse } from '@ngrx/operators'
import { getState, patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals'
import { rxMethod } from '@ngrx/signals/rxjs-interop'
import { pipe, switchMap, tap } from 'rxjs'
import { environment } from '../../environments/environment'
import { ImagesService } from '../images/data-access/images-service'
import { MarkersService } from '../markers/data-access/markers.service'
import type { Atlas } from '../shared/models/atlas.model'
import type { MarkerImage } from '../shared/models/marker-image'
import type { Marker } from '../shared/models/marker'
import { AtlasService } from '../atlas/data-access/services/atlas.service'

export type MapOptions = google.maps.MapOptions & {
  zoom: number
  center: google.maps.LatLngLiteral
}

type AppState = {
  atlasList: { [atlasId: string]: Atlas }
  filter: { query: string; order: 'asc' | 'desc' }
  imageUploadInProgress: boolean
  worldMapState: MapOptions
}

const initialState: AppState = {
  atlasList: {},
  filter: { query: '', order: 'asc' },
  imageUploadInProgress: false,
  worldMapState: {
    draggableCursor: 'grab',
    draggingCursor: 'grab',
    scaleControl: false,
    disableDefaultUI: true,
    scrollwheel: true,
    center: {
      lat: 51.4933675, //Greenwich lat
      lng: 0,
    },
    zoom: 5,
    fullscreenControl: true,
    minZoom: 3,
    mapId: environment.google_map_id,
  },
}

export const AppStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),
  withComputed((state) => ({
    mapsCount: computed(() => Object.values(state.atlasList()).length),
    mapsIterable: computed(() => Object.values(state.atlasList())),
    filteredMaps: computed(() => {
      return Object.values(state.atlasList()).filter((item) => item.title.includes(state.filter().query))
    })
  })),
  withProps(() => ({
    atlasService: inject(AtlasService),
    markersService: inject(MarkersService),
    imagesService: inject(ImagesService),
  })),
  withMethods(({ atlasService, markersService, imagesService, ...store }) => ({
    //filter
    updateQuery: (query: string) => {
      patchState(store, (state) => {
        const newFilter = structuredClone(state.filter)
        newFilter.query = query
        return { ...state, filter: newFilter }
      })
    },
    //ATLAS
    createAtlas: rxMethod<Partial<Atlas>>(
      pipe(
        switchMap((data) => {
          return atlasService.createAtlas(data).pipe(
            tapResponse({
              next: (newAtlas) => {
                patchState(store, (state) => {
                  const currentAtlasList = structuredClone(state.atlasList)
                  newAtlas.markers = []
                  newAtlas.title = data.title ? data.title : '',
                  currentAtlasList[newAtlas.id] = newAtlas

                  return {
                    ...state,
                    atlasList: { ...currentAtlasList },
                  }
                })
              },
              error: console.error,
            }),
          )
        }),
      ),
    ),
    loadAtlasList: rxMethod<void>(
      pipe(
        switchMap(() => {
          return atlasService.loadAtlasList().pipe(
            tapResponse({
              next: (loadedAtlasList) => {
                patchState(store, (state) => {
                  const updatedAtlasList: { [atlasId: string]: Atlas } = {}

                  for (const loadedAtlas of loadedAtlasList) {
                    loadedAtlas.markers = []
                    updatedAtlasList[loadedAtlas.id] = loadedAtlas
                  }
                  return { ...state, atlasList: updatedAtlasList }
                })
              },
              error: console.error,
            }),
          )
        }),
      ),
    ),
    deleteAtlas: rxMethod<{ atlasId: string }>(
      pipe(
        switchMap((val) => {
          return atlasService.deleteAtlas(val.atlasId).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => {
                  const updatedState = structuredClone(state.atlasList)
                  delete updatedState[val.atlasId]
                  return {
                    ...state,
                    atlasList: { ...updatedState },
                  }
                })
              },
              error: console.error,
            }),
          )
        }),
      ),
    ),
    updateAtlas: rxMethod<{ atlasId: string; data: Partial<Atlas> }>(
      pipe(
        switchMap((input) => {
          return atlasService.updateAtlas(input.atlasId, input.data).pipe(
            tapResponse({
              next: (updatedAtlas) => {
                patchState(store, (state) => {
                  const currentAtlasList = structuredClone(state.atlasList)
                  currentAtlasList[updatedAtlas.id] = updatedAtlas

                  return {
                    ...state,
                    atlasList: { ...currentAtlasList },
                  }
                })
              },
              error: console.error,
            }),
          )
        }),
      ),
    ),
    getAtlasById(atlasId: string): Atlas {
      //even if its null we still want to return
      return store.atlasList()[atlasId]
    },
    getAtlasList(): Signal<Atlas[]> {
      return computed(() => Object.values(store.atlasList()))
    },
    //MARKERS
    createMarkers: rxMethod<{ atlasId: string; data: Partial<Marker>[] }>(
      pipe(
        switchMap((params) => {
          return markersService.createMarkers(params.data).pipe(
            tapResponse({
              next: (newMarkers) => {
                patchState(store, (state) => {
                  //populate images
                  const newMarkersWithImages = newMarkers.map((marker,index) => {
                    marker.images = []
                    marker.atlasId = params.atlasId
                    marker.title = params.data[index].title ?? ''
                    marker.latitude = params.data[index].latitude ?? 0
                    marker.longitude = params.data[index].longitude ?? 0
                    return marker
                  })

                  const updatedState = structuredClone(state.atlasList)
                  updatedState[params.atlasId].markers = [...updatedState[params.atlasId].markers, ...newMarkersWithImages]
                  return { ...state, atlasList: updatedState }
                })
              },
              error: console.error,
            }),
          )
        }),
      ),
    ),
    loadMarkers: rxMethod<{ atlasId: string }>(
      pipe(
        switchMap((params) => {
          return markersService.getMarkersForAtlas(params.atlasId).pipe(
            tapResponse({
              next: (loadedMarkers) => {
                patchState(store, (state) => {
                  const updatedState = structuredClone(state.atlasList)

                  //a map may have no markers so I need to check that first
                  if (loadedMarkers) {
                    loadedMarkers.map((marker) => {
                      marker.images = []
                      return marker
                    })
                  } else loadedMarkers = []

                  updatedState[params.atlasId].markers = [
                    ...loadedMarkers.map((marker) => {
                      marker.images = []
                      return marker
                    }),
                  ]
                  return { ...state, atlasList: updatedState }
                })
              },
              error: console.error,
            }),
          )
        }),
      ),
    ),
    updateMarker: rxMethod<{
      atlasId: string
      markerId: string
      data: Partial<Marker>
    }>(
      pipe(
        switchMap((params) => {
          return markersService.updateMarker(params.markerId, params.data).pipe(
            tapResponse({
              next: (updatedMarker) => {
                patchState(store, (state) => {
                  const updatedState = structuredClone(state.atlasList)
                  const oldMarkerIndex = findMarkerIndex(state, params.atlasId, params.markerId)

                  updatedState[params.atlasId].markers[oldMarkerIndex] = {
                    ...updatedMarker,
                    images: state.atlasList[params.atlasId].markers[oldMarkerIndex].images,
                  }
                  return { ...state, atlasList: updatedState }
                })
              },
              error: console.error,
            }),
          )
        }),
      ),
    ),
    deleteMarkers: rxMethod<{ atlasId: string; markerIds: string[] }>(
      pipe(
        switchMap((params) => {
          return markersService.deleteMarkers(params.atlasId, params.markerIds).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => {
                  const updatedState = structuredClone(state.atlasList)

                  const oldMarkers = updatedState[params.atlasId].markers
                  const filteredMarkers = oldMarkers.filter((marker) => !params.markerIds.includes(marker.id))

                  updatedState[params.atlasId].markers = filteredMarkers

                  return { ...state, atlasList: updatedState }
                })
              },
              error: console.error,
            }),
          )
        }),
      ),
    ),
    getMarkersForAtlas(atlasId: string): Signal<Marker[]> {
      return computed(() => store.atlasList()[atlasId].markers)
    },
    getMarkerById: (atlasId: string, markerId: string) => {
      const markerIndex = findMarkerIndex(getState(store), atlasId, markerId)
      return computed(() => store.atlasList()[atlasId].markers[markerIndex])
    },
    // IMAGES
    loadImagesForMarker: rxMethod<{ atlasId: string; markerId: string }>(
      pipe(
        switchMap((params) => {
          return imagesService.getImagesForMarker(params.atlasId, params.markerId).pipe(
            tapResponse({
              next: (images) => {
                patchState(store, (state) => {
                  const updatedState = structuredClone(state.atlasList)

                  const markerIndex = findMarkerIndex(state, params.atlasId, params.markerId)

                  updatedState[params.atlasId].markers[markerIndex].images = images

                  return {
                    ...state,
                    atlasList: updatedState,
                  }
                })
              },
              error: console.error,
            }),
          )
        }),
      ),
    ),
    poolForImages: rxMethod<{
      atlasId: string
      markerId: string
      targetCount: number
    }>(
      pipe(
        tap(() =>
          patchState(store, (state) => {
            return {
              ...state,
              imageUploadInProgress: true,
            }
          }),
        ),
        switchMap((params) => {
          return imagesService.poolForMarkerImages(params.atlasId, params.markerId, params.targetCount).pipe(
            tapResponse({
              next: (images) => {
                patchState(store, (state) => {
                  const updatedState = structuredClone(state.atlasList)

                  const markerIndex = findMarkerIndex(state, params.atlasId, params.markerId)

                  updatedState[params.atlasId].markers[markerIndex].images = images

                  return {
                    ...state,
                    atlasList: updatedState,
                    imageUploadInProgress: false,
                  }
                })
              },
              error: console.error,
            }),
          )
        }),
      ),
    ),
    updateImageForMarker: rxMethod<{
      data: Partial<MarkerImage>
    }>(
      pipe(
        switchMap((params) => {
          return imagesService.updateImageForMarker(params.data).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => {
                  const updatedState = structuredClone(state.atlasList)

                  const oldMarkerIndex = findMarkerIndex(state, params.data.atlasId!, params.data.markerId!)
                  const oldImageIndex = findImageIndex(state, params.data.atlasId!, params.data.markerId!, params.data.id!)

                  const oldImage = store.atlasList()[params.data.atlasId!].markers[oldMarkerIndex].images[oldImageIndex]

                  updatedState[params.data.atlasId!].markers[oldMarkerIndex].images[oldImageIndex] = {
                    ...oldImage,
                    legend: params.data.legend,
                  } //only legend can change

                  return {
                    ...state,
                    atlasList: updatedState,
                  }
                })
              },
              error: console.error,
            }),
          )
        }),
      ),
    ),
    deleteImage: rxMethod<{
      atlasId: string
      markerId: string
      imageId: string
    }>(
      pipe(
        switchMap((params) =>
          imagesService.deleteImageFromMarker(params.atlasId, params.markerId, params.imageId).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => {
                  const updatedState = structuredClone(state.atlasList)

                  const oldMarkerIndex = findMarkerIndex(state, params.atlasId, params.markerId)
                  const oldImageIndex = findImageIndex(state, params.atlasId, params.markerId, params.imageId)

                  updatedState[params.atlasId].markers[oldMarkerIndex].images.splice(oldImageIndex, 1)

                  return {
                    ...state,
                    atlasList: updatedState,
                  }
                })
              },
              error: console.error,
            }),
          ),
        ),
      ),
    ),
    getImagesForMarker: (atlasId: string, markerId: string) => {
      const index = findMarkerIndex(getState(store), atlasId, markerId)
      return computed(() => store.atlasList()[atlasId].markers[index].images)
    },
    // component relate state which arguably should live elsewhere
    setWorldMapState: (arg: MapOptions) => {
      patchState(store, (state) => {
        return {
          ...state,
          worldMapState: arg,
        }
      })
    },
  })),
)

const findMarkerIndex = (state: AppState, atlasId: string, markerId: string) => {
  const markerIndex = state.atlasList[atlasId].markers.findIndex((marker) => marker.id === markerId)

  if (markerIndex === -1) throw new Error('Marker not found')

  return markerIndex
}

const findImageIndex = (state: AppState, atlasId: string, markerId: string, imageId: string) => {
  const markerIndex = findMarkerIndex(state, atlasId, markerId)
  const imageIndex = state.atlasList[atlasId].markers[markerIndex].images.findIndex((img) => img.id === imageId)

  if (imageIndex === -1) throw new Error('Marker not found')

  return imageIndex
}
