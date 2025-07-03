import { Component, inject } from '@angular/core';
import { BannerService } from '../../services/banner-service';

@Component({
  selector: 'app-notification-banner',
  imports: [],
  templateUrl: './notification-banner.component.html',
})
export class BannerComponent {
  bannerService = inject(BannerService);
}
