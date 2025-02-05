import { type ErrorHandler, Injectable, inject } from '@angular/core';
import { BannerService } from './banner-service.js';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlerService implements ErrorHandler {
  bannerService = inject(BannerService);

  handleError(error: Error): void {
    console.error(error);
    this.bannerService.setMessage({ type: 'error', message: error.message });
  }
}
