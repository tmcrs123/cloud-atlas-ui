import {
  Component,
  computed,
  effect,
  inject,
  Signal,
  signal,
} from '@angular/core';
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
import { debounceTime, distinctUntilChanged, filter, startWith } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

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
  protected isDeleteDialogOpen = signal(false);
  protected isAddDialogOpen = signal(false);
  protected store = inject(AppStore);
  protected auth = inject(AuthService);
  protected router = inject(Router);
  protected searchFormControl = new FormControl<string>('');
  protected addMapFormControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });
  protected addMapFormControlStatusChangesSignal = toSignal(
    this.addMapFormControl.statusChanges.pipe(startWith('INVALID'))
  );
  protected deleteMapFormControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  protected deleteMapFormControlStatusChangesSignal = toSignal(
    this.deleteMapFormControl.statusChanges.pipe(startWith('INVALID'))
  );

  protected maps: Signal<SnappinMap[]> = signal([]);

  protected dropdownConfig = computed(() => {
    const baseConfig: DropdownConfig = {
      options: [
        { label: 'Delete Map', index: 0 },
        { label: 'Add Map', index: 1 },
      ],
      buttonConfig: {
        text: 'Add Or Delete',
        type: 'primary_action',
        svg: 'arrow_down',
        disabled: false,
      },
    };

    if (this.maps().length > 0) {
      return baseConfig;
    } else {
      baseConfig.options.splice(1);
      return baseConfig;
    }
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

  protected handleSearchControlChanges$ =
    this.searchFormControl.valueChanges.pipe(
      takeUntilDestroyed(),
      distinctUntilChanged(),
      startWith(''),
      filter((t) => t !== null),
      debounceTime(500)
    );

  constructor() {
    this.handleSearchControlChanges$.subscribe((v) =>
      this.store.updateQuery(v)
    );
  }

  ngOnInit() {
    this.maps = this.store.filteredMaps;
    if (!this.maps() || this.maps().length === 0) {
      this.store.loadMaps();
    }

    this.addMapFormControl.statusChanges.subscribe(console.log);
    console.log(this.addMapFormControl);
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
    this.addMapFormControl.setValue('');
    this.searchFormControl.setValue('');
  }

  protected onDeleteDialogClose(hasMapToDelete: boolean) {
    this.isDeleteDialogOpen.set(false);
    if (!hasMapToDelete) return;
    this.store.deleteMap({ mapId: this.deleteMapFormControl.value });
    this.deleteMapFormControl.setValue('');
  }
}
