import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import DropdownComponent from '../shared/ui/dropdown/dropdown.component';
import { AddMapDialog } from './ui/add-map-dialog.component';

@Component({
  selector: 'app-maps',
  imports: [DropdownComponent, DialogModule],
  templateUrl: './maps.component.html',
  styleUrl: './maps.component.css',
})
export default class MapsComponent {
  dialog = inject(Dialog);

  openDialog() {
    this.dialog.open(AddMapDialog, {
      minWidth: '300px',
    });
  }

  public isDialogOpen = signal(false);

  protected dropdownConfig = {
    buttonText: 'Map actions',
    options: [
      { label: 'Add Map', index: 0 },
      { label: 'Delete Map', index: 1 },
    ],
  };

  handleDropdownAction(index: number) {}
}
