import { DialogConfig } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

export type DialogData = {
  title: string;
  confirmButtonText: string;
  isDeleteDialog: boolean;
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
  readonly deleteButton =
    'bg-red-600 text-white hover:bg-red-700 focus:outline-none shadow-md cursor-pointer font-bold text-lg w-25 x-4 py-2';
  readonly addButton =
    'w-25 x-4 py-2 bg-sky-600 text-white hover:bg-sky-700 focus:outline-none shadow-md cursor-pointer font-bold text-lg';
  protected buttonClasses: any;

  confirmAction() {
    this.dialogClosed.emit(true);
  }

  cancelAction() {
    this.dialogClosed.emit(false);
  }
}
