import { computed, effect, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
import { Marker, SnappinMap, Image } from '../shared/models';
import { MarkersService } from '../markers/data-access/markers.service';
import { ImagesService } from '../images/data-access/images-service';
import { MapsService } from '../maps/data-access/services/maps.service';

type AppState = {
  maps: { [mapId: string]: SnappinMap };
  isLoading: boolean;
  loadingError: Error | null;
};

const initialState: AppState = {
  maps: {},
  isLoading: false,
  loadingError: null,
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    mapsCount: computed(() => Object.values(state.maps()).length),
    mapsIterable: computed(() => Object.values(state.maps())),
  })),
  withHooks({
    onInit(store) {
      effect(() => {
        const state = getState(store);
        console.log('mapsState', state);
      });
    },
  }),
  withProps(() => ({
    mapsService: inject(MapsService),
    markersService: inject(MarkersService),
    imagesService: inject(ImagesService),
  })),
  withMethods(({ mapsService, markersService, imagesService, ...store }) => ({
    //MAPS
    createMap: rxMethod<Partial<SnappinMap>>(
      pipe(
        switchMap((data) => {
          return mapsService.createMap(data).pipe(
            tapResponse({
              next: (newMap) => {
                patchState(store, (state) => {
                  let currentMaps = structuredClone(state.maps);
                  newMap.markers = [];
                  currentMaps[newMap.mapId] = newMap;

                  return {
                    ...state,
                    maps: { ...currentMaps },
                  };
                });
              },
              error: console.error,
            })
          );
        })
      )
    ),
    loadMaps: rxMethod<void>(
      pipe(
        switchMap(() => {
          return mapsService.loadMaps().pipe(
            tapResponse({
              next: (loadedMaps) => {
                patchState(store, (state) => {
                  let updatedMaps: { [mapId: string]: SnappinMap } = {};

                  loadedMaps.forEach((loadedMap) => {
                    loadedMap.markers = [];
                    updatedMaps[loadedMap.mapId] = loadedMap;
                  });
                  return { ...state, maps: updatedMaps };
                });
              },
              error: console.error,
            })
          );
        })
      )
    ),
    deleteMap: rxMethod<{ mapId: string }>(
      pipe(
        switchMap((val) => {
          return mapsService.deleteMap(val.mapId).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => {
                  let updatedState = structuredClone(state.maps);
                  delete updatedState[val.mapId];
                  return {
                    ...state,
                    maps: { ...updatedState },
                  };
                });
              },
              error: console.error,
            })
          );
        })
      )
    ),
    updateMap: rxMethod<{ mapId: string; data: Partial<SnappinMap> }>(
      pipe(
        switchMap((input) => {
          return mapsService.updateMap(input.mapId, input.data).pipe(
            tapResponse({
              next: (updatedMap) => {
                patchState(store, (state) => {
                  let currentMaps = structuredClone(state.maps);
                  currentMaps[updatedMap.mapId] = updatedMap;

                  return {
                    ...state,
                    maps: { ...currentMaps },
                  };
                });
              },
              error: console.error,
            })
          );
        })
      )
    ),
    getMapById(mapId: string): SnappinMap {
      //even if its null we still want to return
      return store.maps()[mapId];
    },
    //MARKERS
    createMarkers: rxMethod<{ mapId: string; data: Partial<Marker>[] }>(
      pipe(
        switchMap((params) => {
          return markersService.createMarkers(params.mapId, params.data).pipe(
            tapResponse({
              next: (newMarkers) => {
                patchState(store, (state) => {
                  //populate images
                  newMarkers = newMarkers.map((marker) => {
                    marker.images = [];
                    return marker;
                  });

                  const updatedState = structuredClone(state.maps);
                  updatedState[params.mapId].markers = [
                    ...updatedState[params.mapId].markers,
                    ...newMarkers,
                  ];
                  return { ...state, maps: updatedState };
                });
              },
              error: console.error,
            })
          );
        })
      )
    ),
    loadMarkers: rxMethod<{ mapId: string }>(
      pipe(
        switchMap((params) => {
          return markersService.getMarkersForMap(params.mapId).pipe(
            tapResponse({
              next: (loadedMarkers) => {
                patchState(store, (state) => {
                  const updatedState = structuredClone(state.maps);

                  //a map may have no markers so I need to check that first
                  if (loadedMarkers) {
                    loadedMarkers.map((marker) => {
                      marker.images = [];
                      return marker;
                    });
                  } else loadedMarkers = [];

                  updatedState[params.mapId].markers = [
                    ...updatedState[params.mapId].markers,
                    ...loadedMarkers.map((marker) => {
                      marker.images = [];
                      return marker;
                    }),
                  ];
                  return { ...state, maps: updatedState };
                });
              },
              error: console.error,
            })
          );
        })
      )
    ),
    updateMarker: rxMethod<{
      mapId: string;
      markerId: string;
      data: Partial<Marker>;
    }>(
      pipe(
        switchMap((params) => {
          return markersService
            .updateMarker(params.mapId, params.markerId, params.data)
            .pipe(
              tapResponse({
                next: (updatedMarker) => {
                  patchState(store, (state) => {
                    const updatedState = structuredClone(state.maps);
                    const oldMarkerIndex = findMarkerIndex(
                      state,
                      params.mapId,
                      params.markerId
                    );

                    updatedState[params.mapId].markers[oldMarkerIndex] =
                      updatedMarker;
                    return { ...state, maps: updatedState };
                  });
                },
                error: console.error,
              })
            );
        })
      )
    ),
    deleteMarkers: rxMethod<{ mapId: string; markerIds: string[] }>(
      pipe(
        switchMap((params) => {
          return markersService
            .deleteMarkers(params.mapId, params.markerIds)
            .pipe(
              tapResponse({
                next: () => {
                  patchState(store, (state) => {
                    const updatedState = structuredClone(state.maps);

                    const oldMarkers = updatedState[params.mapId].markers;
                    const filteredMarkers = oldMarkers.filter(
                      (marker) => !params.markerIds.includes(marker.markerId)
                    );

                    updatedState[params.mapId].markers = filteredMarkers;

                    return { ...state, maps: updatedState };
                  });
                },
                error: console.error,
              })
            );
        })
      )
    ),
    getMarkersForMap(mapId: string): Marker[] {
      return store.maps()[mapId].markers;
    },
    // IMAGES
    getImagesForMarker: rxMethod<{ mapId: string; markerId: string }>(
      pipe(
        switchMap((params) => {
          return imagesService
            .getImagesForMarker(params.mapId, params.markerId)
            .pipe(
              tapResponse({
                next: (images) => {
                  patchState(store, (state) => {
                    const updatedState = structuredClone(state.maps);

                    const markerIndex = findMarkerIndex(
                      state,
                      params.mapId,
                      params.markerId
                    );

                    updatedState[params.mapId].markers[markerIndex].images =
                      images;

                    return {
                      ...state,
                      maps: updatedState,
                    };
                  });
                },
                error: console.error,
              })
            );
        })
      )
    ),
    updateImageForMarker: rxMethod<{
      mapId: string;
      markerId: string;
      imageId: string;
      data: Partial<Image>;
    }>(
      pipe(
        switchMap((params) => {
          return imagesService
            .updateImageForMarker(params.mapId, params.data)
            .pipe(
              tapResponse({
                next: (updatedImage) => {
                  patchState(store, (state) => {
                    const updatedState = structuredClone(state.maps);

                    const oldMarkerIndex = findMarkerIndex(
                      state,
                      params.mapId,
                      params.markerId
                    );
                    const oldImageIndex = findImageIndex(
                      state,
                      params.mapId,
                      params.markerId,
                      params.imageId
                    );

                    updatedState[params.mapId].markers[oldMarkerIndex].images[
                      oldImageIndex
                    ] = updatedImage;

                    return {
                      ...state,
                      maps: updatedState,
                    };
                  });
                },
                error: console.error,
              })
            );
        })
      )
    ),
  }))
);

const findMarkerIndex = (state: AppState, mapId: string, markerId: string) => {
  const markerIndex = state.maps[mapId].markers.findIndex(
    (marker) => marker.markerId === markerId
  );

  if (markerIndex === -1) throw new Error('Marker not found');

  return markerIndex;
};

const findImageIndex = (
  state: AppState,
  mapId: string,
  markerId: string,
  imageId: string
) => {
  const markerIndex = findMarkerIndex(state, mapId, markerId);
  const imageIndex = state.maps[mapId].markers[markerIndex].images.findIndex(
    (img) => img.imageId === imageId
  );

  if (imageIndex === -1) throw new Error('Marker not found');

  return imageIndex;
};
