import { ErrorHandler, inject, Injectable } from '@angular/core';
import { BannerService } from './banner-service';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlerService implements ErrorHandler {
  bannerService = inject(BannerService);

  handleError(error: Error): void {
    this.bannerService.setMessage({ type: 'error', message: error.message });
  }
}
