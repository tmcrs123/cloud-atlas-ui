import { Component, signal } from '@angular/core';
import {
  CustomDialogConfig,
  DialogComponent,
} from '../shared/ui/dialog/dialog.component';
import DropdownComponent from '../shared/ui/dropdown/dropdown.component';
import SelectComponent from '../shared/ui/select/select.component';

@Component({
  selector: 'app-maps',
  imports: [DropdownComponent, DialogComponent, SelectComponent],
  templateUrl: './maps.component.html',
})
export default class MapsComponent {
  public isDeleteDialogOpen = signal(false);
  public isAddDialogOpen = signal(false);

  protected dropdownConfig = {
    buttonText: 'Map actions',
    options: [
      { label: 'Add Map', index: 0 },
      { label: 'Delete Map', index: 1 },
    ],
  };

  protected addMapDialogConfig: CustomDialogConfig = {
    data: {
      confirmButtonText: 'Add',
      title: 'What is the name of your new map?',
      isDeleteDialog: false,
    },
  };

  protected deleteMapDialogConfig: CustomDialogConfig = {
    data: {
      confirmButtonText: 'Delete',
      title: 'Select a map for deletion',
      isDeleteDialog: true,
    },
  };
}
