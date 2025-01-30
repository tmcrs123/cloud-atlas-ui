import { Component, effect, inject, Signal, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
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
import { Router } from '@angular/router';
import { SnappinMap } from '../shared/models';

@Component({
  selector: 'app-maps',
  imports: [
    DropdownComponent,
    DialogComponent,
    SelectComponent,
    CardComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './maps.component.html',
})
export default class MapsComponent {
  public isDeleteDialogOpen = signal(false);
  public isAddDialogOpen = signal(false);
  public store = inject(AppStore);
  public auth = inject(AuthService);
  public router = inject(Router);
  public addMapFormControl = new FormControl<string>('', {
    nonNullable: true,
    validators: Validators.minLength(3),
  });
  public deleteMapFormControl = new FormControl<string>('', {
    nonNullable: true,
  });
  public maps: Signal<SnappinMap[]> = signal([]);

  ngOnInit() {
    this.maps = this.store.getMaps();
    if (!this.maps() || this.maps().length === 0) {
      this.store.loadMaps();
    }
  }

  fetchSelectOptions() {
    return this.maps().map((m) => ({ title: m.title, value: m.mapId }));
  }

  protected navigateToMarkers(mapId: string) {
    this.router.navigateByUrl(`markers/${mapId}`);
  }

  public onAddDialogClose(hasMapToAdd: boolean) {
    this.isAddDialogOpen.set(false);
    if (!hasMapToAdd) return;
    this.store.createMap({ title: this.addMapFormControl.value });
    this.addMapFormControl.setValue('');
  }

  public onDeleteDialogClose(hasMapToDelete: boolean) {
    this.isDeleteDialogOpen.set(false);
    if (!hasMapToDelete) return;
    this.store.deleteMap({ mapId: this.deleteMapFormControl.value });
    this.deleteMapFormControl.setValue('');
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
    title: 'What is the name of your new map?',
    isDeleteDialog: false,
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
    data: this.store.maps(),
    title: 'Select a map for deletion',
    isDeleteDialog: true,
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
