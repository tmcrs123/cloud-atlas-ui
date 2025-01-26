import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

@Component({
  templateUrl: './add-map-dialog.component.html',
})
export class AddMapDialog {
  data = inject(DIALOG_DATA);
}
