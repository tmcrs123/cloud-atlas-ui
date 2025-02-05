import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  isLoading = signal(false);
  isLoaderVisible = computed(() => {
    return !!this.isLoading();
  });
}
