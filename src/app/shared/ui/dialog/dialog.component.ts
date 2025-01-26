import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent {
  isDialogOpen = input<boolean>(false);
  dialogClosed = output<void>();

  confirmAction() {
    this.dialogClosed.emit();
  }
}
