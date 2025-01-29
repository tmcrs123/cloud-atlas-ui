import { Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '../shared/ui/button/button.component';
import { CardComponent } from '../shared/ui/card/card.component';
import {
  CustomDialogConfig,
  DialogComponent,
} from '../shared/ui/dialog/dialog.component';
import DropdownComponent, {
  DropdownConfig,
} from '../shared/ui/dropdown/dropdown.component';
import SelectComponent from '../shared/ui/select/select.component';
import { AppStore } from '../store/store';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-maps',
  imports: [DropdownComponent, DialogComponent, SelectComponent, CardComponent],
  templateUrl: './maps.component.html',
})
export default class MapsComponent {
  public isDeleteDialogOpen = signal(false);
  public isAddDialogOpen = signal(false);
  public store = inject(AppStore);
  public auth = inject(AuthService);

  ngOnInit() {
    this.store.loadMaps();
  }

  protected dropdownConfig: DropdownConfig = {
    options: [
      { label: 'Add Map', index: 0 },
      { label: 'Delete Map', index: 1 },
    ],
    buttonConfig: {
      text: 'Add Or Delete',
      type: 'primary_action',
      svg: 'arrow_down',
    },
  };

  protected addMapDialogConfig: CustomDialogConfig = {
    data: {
      confirmButtonText: 'Add',
      title: 'What is the name of your new map?',
      isDeleteDialog: false,
    },
    primaryActionButtonConfig: {
      text: 'Add map',
      type: 'add',
    },
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };

  protected deleteMapDialogConfig: CustomDialogConfig = {
    data: {
      confirmButtonText: 'Delete',
      title: 'Select a map for deletion',
      isDeleteDialog: true,
    },
    primaryActionButtonConfig: {
      text: 'Delete map',
      type: 'delete',
    },
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };
}
