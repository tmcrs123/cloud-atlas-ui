import { computed, effect, inject, Signal } from '@angular/core';
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
import { of, pipe, switchMap } from 'rxjs';
import { Marker, SnappinMap, MarkerImage } from '../shared/models';
import { MarkersService } from '../markers/data-access/markers.service';
import { ImagesService } from '../images/data-access/images-service';
import { MapsService } from '../maps/data-access/services/maps.service';

type AppState = {
  maps: { [mapId: string]: SnappinMap };
  filter: { query: string; order: 'asc' | 'desc' };
};

const initialState: AppState = {
  maps: {},
  filter: { query: '', order: 'asc' },
};

export const AppStore = signalStore(
  { providedIn: 'root' },

  withHooks({
    onInit(store) {
      effect(() => {
        const state = getState(store);
        console.log('mapsState', state);
      });
    },
  }),
  withState(initialState),
  withComputed((state) => ({
    mapsCount: computed(() => Object.values(state.maps()).length),
    mapsIterable: computed(() => Object.values(state.maps())),
    filteredMaps: computed(() => {
      return Object.values(state.maps()).filter((item) =>
        item.title.includes(state.filter().query)
      );
    }),
  })),
  withProps(() => ({
    mapsService: inject(MapsService),
    markersService: inject(MarkersService),
    imagesService: inject(ImagesService),
  })),
  withMethods(({ mapsService, markersService, imagesService, ...store }) => ({
    //filter
    updateQuery: (query: string) => {
      patchState(store, (state) => {
        let newFilter = structuredClone(state.filter);
        newFilter.query = query;
        return { ...state, filter: newFilter };
      });
    },
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
    getMaps(): Signal<SnappinMap[]> {
      return computed(() => Object.values(store.maps()));
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

                    updatedState[params.mapId].markers[oldMarkerIndex] = {
                      ...updatedMarker,
                      images:
                        state.maps[params.mapId].markers[oldMarkerIndex].images,
                    };
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
    getMarkersForMap(mapId: string): Signal<Marker[]> {
      return computed(() => store.maps()[mapId].markers);
    },
    getMarkerById: (mapId: string, markerId: string) => {
      const markerIndex = findMarkerIndex(getState(store), mapId, markerId);
      return computed(() => store.maps()[mapId].markers[markerIndex]);
    },
    // IMAGES
    loadImagesForMarker: rxMethod<{ mapId: string; markerId: string }>(
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
      data: Partial<MarkerImage>;
    }>(
      pipe(
        switchMap((params) => {
          return imagesService.updateImageForMarker(params.data).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => {
                  const updatedState = structuredClone(state.maps);

                  const oldMarkerIndex = findMarkerIndex(
                    state,
                    params.data.mapId!,
                    params.data.markerId!
                  );
                  const oldImageIndex = findImageIndex(
                    state,
                    params.data.mapId!,
                    params.data.markerId!,
                    params.data.imageId!
                  );

                  const oldImage =
                    store.maps()[params.data.mapId!].markers[oldMarkerIndex]
                      .images[oldImageIndex];

                  updatedState[params.data.mapId!].markers[
                    oldMarkerIndex
                  ].images[oldImageIndex] = {
                    ...oldImage,
                    legend: params.data.legend,
                  }; //only legend can change

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
    deleteImage: rxMethod<{ mapId: string; markerId: string; imageId: string }>(
      pipe(
        switchMap((params) =>
          imagesService
            .deleteImageFromMarker(
              params.mapId,
              params.markerId,
              params.imageId
            )
            .pipe(
              tapResponse({
                next: () => {
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

                    updatedState[params.mapId].markers[
                      oldMarkerIndex
                    ].images.splice(oldImageIndex, 1);

                    return {
                      ...state,
                      maps: updatedState,
                    };
                  });
                },
                error: console.error,
              })
            )
        )
      )
    ),
    getImagesForMarker: (mapId: string, markerId: string) => {
      const index = findMarkerIndex(getState(store), mapId, markerId);
      return computed(() => store.maps()[mapId].markers[index].images);
    },
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
