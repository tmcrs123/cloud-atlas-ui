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
import { Marker } from '../../../shared/models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { effect, inject } from '@angular/core';
import { MarkersService } from './markers.service';
import { pipe, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

type MarkersState = {
  maps: { [mapId: string]: { [markerId: string]: Marker } };
};

const initialState: MarkersState = {
  maps: {},
};

export const MarkersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  // withProps here is just a different way of exposing the markersService, but achieves the same as maps store
  withHooks({
    onInit: (store) => {
      effect(() => {
        const state = getState(store);
        console.log('markers state', state);
      });
    },
  }),
  withProps(() => ({
    markersService: inject(MarkersService),
  })),
  withMethods(({ markersService, ...store }) => ({
    createMarkers: rxMethod<{ mapId: string; data: Partial<Marker>[] }>(
      pipe(
        switchMap((params) => {
          return markersService.createMarkers(params.mapId, params.data).pipe(
            tapResponse({
              next: (newMarkers) => {
                patchState(store, (state) => {
                  const updatedState = { ...state.maps };
                  updatedState[params.mapId] = {
                    ...updatedState[params.mapId],
                    ...newMarkers,
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
    loadMarkers: rxMethod<{ mapId: string }>(
      pipe(
        switchMap((params) => {
          return markersService.getMarkersForMap(params.mapId).pipe(
            tapResponse({
              next: (markers) => {
                patchState(store, (state) => {
                  const newState = { ...state.maps };
                  newState[params.mapId] = { ...markers };
                  return {
                    ...state,
                    maps: { ...newState },
                  };
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
                    const newState = structuredClone(state.maps);
                    newState[params.mapId][params.markerId] = updatedMarker;
                    return { ...state, maps: { ...newState } };
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
                    const newState = structuredClone(state.maps);
                    for (const id of params.markerIds) {
                      delete newState[params.mapId][id];
                    }

                    return { ...state, maps: { ...newState } };
                  });
                },
                error: console.error,
              })
            );
        })
      )
    ),

    getMarkersForMap(mapId: string): Marker[] {
      return Object.values(store.maps()[mapId]);
    },
  }))
);
