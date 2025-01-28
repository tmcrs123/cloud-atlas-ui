import { Component, inject, signal } from '@angular/core';
import { CustomDialogConfig } from '../shared/ui/dialog/dialog.component';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-marker',
  imports: [RouterLink],
  templateUrl: './marker.component.html',
})
export default class MarkerComponent {
  showMap = signal(false);
  router = inject(Router);

  protected dialogConfig: CustomDialogConfig = {
    data: {
      confirmButtonText: 'Delete',
      title: 'Delete image',
      isDeleteDialog: true,
    },
  };

  protected goToMap(mapMode: string) {
    this.router.navigate(['atlas'], { queryParams: { mapMode } });
  }
}
