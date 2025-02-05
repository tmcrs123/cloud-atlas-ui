import { Component, input } from '@angular/core';

@Component({
  selector: 'app-warning-banner',
  templateUrl: './warning-banner.component.html',
})
export class WarningBannerComponent {
  warningText = input('');
}
