import { effect, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  getState,
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
import { Image } from '../../../shared/models/index.js';
import { ImagesService } from './images-service.js';

type ImagesState = {
  maps: { [mapId: string]: { [markerId: string]: Image[] } };
};

const initialState: ImagesState = {
  maps: {},
};

export const ImagesStore = signalStore(
  {
    providedIn: 'root',
  },
  withState(initialState),
  withHooks({
    onInit: (store) => {
      effect(() => {
        const state = getState(store);
        console.log('images state', state);
      });
    },
  }),
  withProps(() => ({
    imagesService: inject(ImagesService),
  })),
  withMethods(({ imagesService, ...store }) => ({
    getImagesForMarker: rxMethod<{ mapId: string; markerId: string }>(
      pipe(
        switchMap((params) => {
          return imagesService
            .getImagesForMarker(params.mapId, params.markerId)
            .pipe(
              tapResponse({
                next: (images) => {
                  patchState(store, (state) => {
                    const newState = structuredClone(state.maps);
                    newState[params.mapId][params.markerId] = images;

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
  }))
);
