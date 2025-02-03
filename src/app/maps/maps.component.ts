import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, startWith } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { SnappinMap } from '../shared/models';
import { CardComponent } from '../shared/ui/card/card.component';
import { CustomDialogConfig, DialogComponent } from '../shared/ui/dialog/dialog.component';
import DropdownComponent, { DropdownConfig } from '../shared/ui/dropdown/dropdown.component';
import SelectComponent from '../shared/ui/select/select.component';
import { AppStore } from '../store/store';
import { BannerService } from '../shared/services/banner-service';

@Component({
  selector: 'app-maps',
  imports: [DropdownComponent, DialogComponent, SelectComponent, CardComponent, ReactiveFormsModule, CommonModule],
  providers: [DatePipe],
  templateUrl: './maps.component.html',
})
export default class MapsComponent {
  //inject
  protected auth = inject(AuthService);
  protected banner = inject(BannerService);
  protected datePipe = inject(DatePipe);
  protected router = inject(Router);
  protected store = inject(AppStore);

  // Controls
  protected searchFormControl = new FormControl<string>('');
  protected addMapFormControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });
  protected deleteMapFormControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  //signals
  protected isDeleteDialogOpen = signal(false);
  protected isAddDialogOpen = signal(false);
  protected addMapFormControlStatusChangesSignal = toSignal(this.addMapFormControl.statusChanges.pipe(startWith('INVALID')));
  protected deleteMapFormControlStatusChangesSignal = toSignal(this.deleteMapFormControl.statusChanges.pipe(startWith('INVALID')));
  protected maps: Signal<SnappinMap[]> = signal([]);
  protected canAddMaps = this.store.canAddMaps;
  protected dropdownConfig = computed(() => {
    const baseConfig: DropdownConfig = {
      options: [],
      buttonConfig: {
        text: 'Add Or Delete',
        type: 'primary_action',
        svg: 'arrow_down',
        disabled: false,
      },
    };
    if (this.canAddMaps()) baseConfig.options.push({ label: 'Add Map', index: 1 });
    if (this.maps().length > 0) baseConfig.options.push({ label: 'Delete Map', index: 0 });

    return baseConfig;
  });
  protected addMapDialogConfig = computed<CustomDialogConfig>(() => {
    return {
      title: 'What is the name of your new map?',
      primaryActionButtonConfig: {
        text: 'Add map',
        type: 'add',
        disabled: this.addMapFormControlStatusChangesSignal() === 'INVALID',
      },
      secondaryActionButtonConfig: {
        text: 'Cancel',
        type: 'secondary_action',
      },
    };
  });
  protected deleteMapDialogConfig = computed<CustomDialogConfig>(() => {
    return {
      data: this.store.maps(),
      title: 'Select a map for deletion',
      primaryActionButtonConfig: {
        text: 'Delete map',
        type: 'delete',
        disabled: this.deleteMapFormControlStatusChangesSignal() === 'INVALID',
      },
      secondaryActionButtonConfig: {
        text: 'Cancel',
        type: 'secondary_action',
      },
    };
  });

  // observables
  protected handleSearchControlChanges$ = this.searchFormControl.valueChanges.pipe(
    takeUntilDestroyed(),
    distinctUntilChanged(),
    startWith(''),
    filter((t) => t !== null),
    debounceTime(500)
  );

  constructor() {
    this.handleSearchControlChanges$.subscribe((v) => this.store.updateQuery(v));
    effect(() => {
      if (!this.canAddMaps()) {
        this.banner.setMessage({ message: 'You have reached the limit of 25 maps 🗻', type: 'info' });
      }
    });
  }

  ngOnInit() {
    this.maps = this.store.filteredMaps;
    this.addMapFormControl.statusChanges.subscribe(console.log);
  }

  fetchSelectOptions() {
    return this.maps().map((m) => ({ title: m.title, value: m.mapId }));
  }

  protected navigateToMarkers(mapId: string) {
    this.router.navigateByUrl(`markers/${mapId}`);
  }

  protected onAddDialogClose(hasMapToAdd: boolean) {
    this.isAddDialogOpen.set(false);
    if (!hasMapToAdd) return;
    this.store.createMap({ title: this.addMapFormControl.value });
    this.addMapFormControl.reset();
    this.searchFormControl.reset();
  }

  protected onDeleteDialogClose(hasMapToDelete: boolean) {
    this.isDeleteDialogOpen.set(false);
    if (!hasMapToDelete) return;
    this.store.deleteMap({ mapId: this.deleteMapFormControl.value });
    this.deleteMapFormControl.reset();
  }
}
