import type { DialogConfig } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, type ElementRef, effect, input, output, viewChild } from '@angular/core';
import { ButtonComponent, type ButtonConfig } from '../button/button.component';

export type DialogData = {
  data: unknown;
};

// my modals always have data
export interface CustomDialogConfig extends Omit<DialogConfig, 'data'> {
  data?: unknown;
  primaryActionButtonConfig?: ButtonConfig;
  secondaryActionButtonConfig: ButtonConfig;
  title: string;
}

@Component({
  selector: 'app-dialog',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './dialog.component.html',
})
export class DialogComponent {
  dialogConfig = input.required<CustomDialogConfig>();
  dialogClosed = output<boolean>();
  open = input.required<boolean>();
  dialogBody = viewChild<ElementRef<HTMLDivElement>>('dialogBody');

  constructor() {
    effect(() => {
      if (this.dialogBody()) this.dialogBody()?.nativeElement.focus();
    });
  }
  confirmAction() {
    this.dialogClosed.emit(true);
  }

  cancelAction() {
    this.dialogClosed.emit(false);
  }

  protected fetchPrimaryActionButtonConfig(): ButtonConfig {
    return this.dialogConfig().primaryActionButtonConfig as unknown as ButtonConfig;
  }
}
