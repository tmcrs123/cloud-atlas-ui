import { Component, inject, signal } from '@angular/core';
import { CustomDialogConfig } from '../shared/ui/dialog/dialog.component';
import { Router, RouterLink } from '@angular/router';
import {
  ButtonComponent,
  ButtonConfig,
} from '../shared/ui/button/button.component';
import { CardComponent } from '../shared/ui/card/card.component';

@Component({
  selector: 'app-marker',
  imports: [ButtonComponent, CardComponent],
  templateUrl: './marker.component.html',
})
export default class MarkerComponent {
  showMap = signal(false);
  router = inject(Router);

  protected goToMapButtonConfig: ButtonConfig = {
    text: 'Show on map',
    type: 'primary_action',
    svg: 'globe',
  };

  protected addMarkerButtonConfig: ButtonConfig = {
    text: 'Add marker',
    type: 'add',
    svg: 'plus',
  };

  protected dialogConfig: CustomDialogConfig = {
    data: {
      confirmButtonText: 'Delete',
      title: 'Delete image',
      isDeleteDialog: true,
    },
    primaryActionButtonConfig: {
      text: 'Delete image',
      type: 'add',
    },
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };

  protected goToMap(mapMode: string) {
    this.router.navigate(['atlas'], { queryParams: { mapMode } });
  }
}
