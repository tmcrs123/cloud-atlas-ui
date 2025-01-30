import { DialogConfig } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonConfig, ButtonComponent } from '../button/button.component';

export type DialogData = {
  data: unknown;
};

// my modals always have data
export interface CustomDialogConfig extends Omit<DialogConfig, 'data'> {
  data?: unknown;
  primaryActionButtonConfig?: ButtonConfig;
  secondaryActionButtonConfig: ButtonConfig;
  title: string;
  isDeleteDialog: boolean;
}

@Component({
  selector: 'app-dialog',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent {
  dialogConfig = input.required<CustomDialogConfig>();

  open = input.required<boolean>();
  dialogClosed = output<boolean>();

  confirmAction() {
    this.dialogClosed.emit(true);
  }

  cancelAction() {
    this.dialogClosed.emit(false);
  }

  protected fetchPrimaryActionButtonConfig(): ButtonConfig {
    return this.dialogConfig()
      .primaryActionButtonConfig as unknown as ButtonConfig;
  }
}
