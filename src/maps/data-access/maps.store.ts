import { computed, effect, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
import { SnappinMap } from '../../shared/models';
import { MapsService } from './services/maps.service';

type MapsState = {
  maps: { [mapId: string]: SnappinMap };
  isLoading: boolean;
  loadingError: Error | null;
};

const initialState: MapsState = {
  maps: {},
  isLoading: false,
  loadingError: null,
};

export const MapsStore = signalStore(
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
  withMethods((store, mapsService = inject(MapsService)) => ({
    createMap: rxMethod<Partial<SnappinMap>>(
      pipe(
        switchMap((data) => {
          return mapsService.createMap(data).pipe(
            tapResponse({
              next: (newMap) => {
                patchState(store, (state) => {
                  let currentMaps = { ...state.maps };
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
              next: (maps) => {
                patchState(store, (state) => ({
                  ...state,
                  maps: { ...maps },
                  isLoading: false,
                }));
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
                  let currentMaps = { ...state.maps };
                  delete currentMaps[val.mapId];
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
    updateMap: rxMethod<{ mapId: string; data: Partial<SnappinMap> }>(
      pipe(
        switchMap((input) => {
          return mapsService.updateMap(input.mapId, input.data).pipe(
            tapResponse({
              next: (updatedMap) => {
                patchState(store, (state) => {
                  let currentMaps = { ...state.maps };
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
  }))
);
