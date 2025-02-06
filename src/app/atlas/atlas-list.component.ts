import { CommonModule, DatePipe } from '@angular/common';
import { Component, type Signal, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, startWith } from 'rxjs';
import type { Atlas } from '../shared/models/atlas.model';
import { BannerService } from '../shared/services/banner-service.js';
import { CardComponent } from '../shared/ui/card/card.component';
import { type CustomDialogConfig, DialogComponent } from '../shared/ui/dialog/dialog.component';
import { DropdownComponent, type DropdownConfig } from '../shared/ui/dropdown/dropdown.component';
import { SelectComponent } from '../shared/ui/select/select.component';
import { AppStore } from '../store/store.js';
import { AuthService } from '../auth/auth.service';
import { ButtonComponent, type ButtonConfig } from '../shared/ui/button/button.component';

@Component({
  selector: 'app-atlas-list',
  imports: [DropdownComponent, DialogComponent, SelectComponent, CardComponent, ReactiveFormsModule, CommonModule, ButtonComponent],
  providers: [DatePipe],
  templateUrl: './atlas-list.component.html',
})
export class AtlasListComponent {
  //config
  protected addAtlasMobileBtnConfig: ButtonConfig = {
    text: '',
    type: 'secondary_action',
    svg: 'speech_bubble',
    customCss: 'rounded-full bg-pink-600 text-white hover:bg-pink-700 focus:outline-none shadow-md cursor-pointer p-3',
  };

  protected deleteAtlasMobileBtnConfig: ButtonConfig = {
    text: '',
    type: 'primary_action',
    svg: 'speech_bubble',
    customCss: 'rounded-full bg-sky-600 text-white hover:bg-pink-700 focus:outline-none shadow-md cursor-pointer p-3',
  };

  //inject
  protected auth = inject(AuthService);
  protected banner = inject(BannerService);
  protected datePipe = inject(DatePipe);
  protected router = inject(Router);
  protected store = inject(AppStore);

  // Controls
  protected searchAtlasFormControl = new FormControl<string>('');
  protected addAtlasFormControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });
  protected deleteAtlasFormControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  //signals
  protected isDeleteDialogOpen = signal(false);
  protected isAddDialogOpen = signal(false);
  protected addAtlasFormControlStatusChangesSignal = toSignal(this.addAtlasFormControl.statusChanges.pipe(startWith('INVALID')));
  protected deleteAtlasFormControlStatusChangesSignal = toSignal(this.deleteAtlasFormControl.statusChanges.pipe(startWith('INVALID')));
  protected atlasList: Signal<Atlas[]> = signal([]);
  protected canAddAtlas = this.store.canAddMaps;
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
    if (this.canAddAtlas()) baseConfig.options.push({ label: 'Add Map', index: 1 });
    if (this.atlasList().length > 0) baseConfig.options.push({ label: 'Delete Map', index: 0 });

    return baseConfig;
  });
  protected addAtlasDialogConfig = computed<CustomDialogConfig>(() => {
    return {
      title: 'What is the name of your new map?',
      primaryActionButtonConfig: {
        text: 'Add map',
        type: 'add',
        disabled: this.addAtlasFormControlStatusChangesSignal() === 'INVALID',
      },
      secondaryActionButtonConfig: {
        text: 'Cancel',
        type: 'secondary_action',
      },
    };
  });
  protected deleteAtlasDialogConfig = computed<CustomDialogConfig>(() => {
    return {
      data: this.store.atlasList(),
      title: 'Select a map for deletion',
      primaryActionButtonConfig: {
        text: 'Delete map',
        type: 'delete',
        disabled: this.deleteAtlasFormControlStatusChangesSignal() === 'INVALID',
      },
      secondaryActionButtonConfig: {
        text: 'Cancel',
        type: 'secondary_action',
      },
    };
  });

  // observables
  protected handleSearchControlChanges$ = this.searchAtlasFormControl.valueChanges.pipe(
    takeUntilDestroyed(),
    distinctUntilChanged(),
    startWith(''),
    filter((t) => t !== null),
    debounceTime(500)
  );

  constructor() {
    this.handleSearchControlChanges$.subscribe((v) => this.store.updateQuery(v));
    effect(() => {
      if (!this.canAddAtlas()) {
        this.banner.setMessage({ message: 'You have reached the limit of 25 maps 🗻', type: 'info' });
      }
    });
  }

  ngOnInit() {
    this.store.loadAtlasList();
    this.atlasList = this.store.filteredMaps;
  }

  fetchSelectOptions() {
    return this.atlasList().map((m) => ({ title: m.title, value: m.atlasId }));
  }

  protected navigateToMarkers(atlasId: string) {
    this.router.navigateByUrl(`markers/${atlasId}`);
  }

  protected onAddDialogClose(hasAtlasToAdd: boolean) {
    this.isAddDialogOpen.set(false);
    if (!hasAtlasToAdd) return;
    this.store.createAtlas({ title: this.addAtlasFormControl.value });
    this.addAtlasFormControl.reset();
    this.searchAtlasFormControl.reset();
  }

  protected onDeleteDialogClose(hasAtlasToDelete: boolean) {
    this.isDeleteDialogOpen.set(false);
    if (!hasAtlasToDelete) return;
    this.store.deleteAtlas({ atlasId: this.deleteAtlasFormControl.value });
    this.deleteAtlasFormControl.reset();
  }
}
