import { DialogConfig } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import {
  outputFromObservable,
  outputToObservable,
} from '@angular/core/rxjs-interop';

export type DialogData = {
  title: string;
  confirmButtonText: string;
};

// my modals always have data
export interface CustomDialogConfig extends Omit<DialogConfig, 'data'> {
  data: DialogData;
}

@Component({
  selector: 'app-dialog',
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent {
  dialogConfig = input.required<CustomDialogConfig>();
  open = input.required<boolean>();
  dialogClosed = output<boolean>();
  dialogClosed$ = outputToObservable(this.dialogClosed);

  confirmAction() {
    this.dialogClosed.emit(true);
  }

  cancelAction() {
    this.dialogClosed.emit(false);
  }
}
