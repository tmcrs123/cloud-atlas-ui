import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  Signal,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import {
  outputToObservable,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  bufferCount,
  filter,
  from,
  fromEvent,
  map,
  mergeMap,
  Observable,
  scan,
  tap,
} from 'rxjs';
import { Marker, MarkerImage } from '../../../shared/models';
import {
  ButtonComponent,
  ButtonConfig,
} from '../../../shared/ui/button/button.component';
import {
  CustomDialogConfig,
  DialogComponent,
} from '../../../shared/ui/dialog/dialog.component';
import DropdownComponent, {
  DropdownConfig,
} from '../../../shared/ui/dropdown/dropdown.component';
import {
  LightboxComponent,
  LightboxConfig,
} from '../../../shared/ui/lightbox/lightbox.component';
import { WarningBannerComponent } from '../../../shared/ui/warning-banner/warning-banner.component';
import { AppStore } from '../../../store/store';
import { ImageUploadComponent } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-marker-detail',
  imports: [
    LightboxComponent,
    DropdownComponent,
    DialogComponent,
    ButtonComponent,
    ReactiveFormsModule,
    WarningBannerComponent,
    ImageUploadComponent,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './marker-detail.component.html',
})
export default class MarkerDetailComponent {
  protected deleteDialogConfig: CustomDialogConfig = {
    title: 'Delete image',
    primaryActionButtonConfig: {
      text: 'Delete image',
      type: 'delete',
    },
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };

  protected readonly addCaptionDialogConfig: CustomDialogConfig = {
    title: 'Add or update caption for image',
    primaryActionButtonConfig: {
      text: 'Save',
      type: 'add',
    },
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };

  protected readonly addJournalEntryDialogConfig: CustomDialogConfig = {
    title: 'Manage journal entry',
    primaryActionButtonConfig: {
      text: 'Save journal',
      type: 'add',
    },
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };

  protected readonly displayCaptionDialogConfig: CustomDialogConfig = {
    title: 'Caption',
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };

  protected dropdownConfig: DropdownConfig = {
    options: [
      { label: 'Delete', index: 0 },
      { label: 'Manage caption', index: 1 },
    ],
    buttonConfig: {
      text: '',
      type: 'primary_action',
      svg: 'plus',
      customCss:
        'rounded-full bg-sky-600 text-white hover:bg-sky-700 focus:outline-none shadow-md cursor-pointer p-1',
    },
  };
  protected displayCaptionButtonConfig: ButtonConfig = {
    text: '',
    type: 'accent',
    svg: 'speech_bubble',
    customCss:
      'rounded-full bg-pink-600 text-white hover:bg-pink-700 focus:outline-none shadow-md cursor-pointer p-1',
  };

  protected addJournalEntryButtonConfig: ButtonConfig = {
    text: 'Add journal',
    type: 'add',
    svg: 'pencil',
  };

  protected isDeleteDialogOpen = signal(false);
  protected isAddCaptionDialogOpen = signal(false);
  protected isDisplayCaptionDialogOpen = signal(false);
  protected isJournalEntryDialogOpen = signal(false);
  protected isLightboxOpen = signal(false);
  protected = signal(false);
  protected deleteDialogRef =
    viewChild.required<DialogComponent>('deleteImageDialog');
  protected addCaptionDialogRef =
    viewChild.required<DialogComponent>('addCaptionDialog');
  protected displayCaptionDialogRef = viewChild.required<DialogComponent>(
    'displayCaptionDialog'
  );
  protected addJournalEntryDialogRef = viewChild.required<DialogComponent>(
    'addJournalEntryDialog'
  );
  protected dropdowns = viewChildren(DropdownComponent);
  destroyRef = inject(DestroyRef);
  protected addJournalEntryFormControl = new FormControl<string | undefined>(
    '',
    {
      nonNullable: true,
    }
  );

  store = inject(AppStore);
  route = inject(ActivatedRoute);
  protected mapId: string = '';
  protected mapTitle: string;
  protected markerId: string = '';
  protected images: Signal<MarkerImage[]> = signal([]);
  protected addCaptionFormControl = new FormControl<string>('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  protected focusedImagedIndex = signal<number | null>(null);
  protected marker!: Signal<Marker>;

  handleClick(imageIndex: number) {
    this.focusedImagedIndex.set(imageIndex);
    this.isDisplayCaptionDialogOpen.set(!this.isDisplayCaptionDialogOpen());
  }

  constructor() {
    effect(() => {
      this.addJournalEntryFormControl.setValue(this.marker().journal);
      console.log('images', this.images());
    });
  }

  ngOnInit() {
    this.mapId = this.route.snapshot.paramMap.get('mapId')!;
    this.markerId = this.route.snapshot.paramMap.get('markerId')!;
    this.marker = this.store.getMarkerById(this.mapId, this.markerId);
    this.mapTitle = this.store.getMapById(this.mapId).title;

    // caching needs to be included here
    this.store.loadImagesForMarker({
      mapId: this.mapId,
      markerId: this.markerId,
    });

    this.images = this.store.getImagesForMarker(this.mapId, this.markerId);
  }

  onDropdownOptionSelected(option: number, dropdownIndex: number) {
    this.focusedImagedIndex.set(dropdownIndex);
    if (option) {
      this.isAddCaptionDialogOpen.set(!this.isAddCaptionDialogOpen());
    } else {
      this.isDeleteDialogOpen.set(!this.isDeleteDialogOpen());
    }
  }

  saveCaption() {
    const image = this.images()[this.focusedImagedIndex()!];
    this.store.updateImageForMarker({
      data: {
        mapId: this.mapId,
        markerId: this.markerId,
        imageId: image.imageId,
        legend: this.addCaptionFormControl.value,
      },
    });
    this.isAddCaptionDialogOpen.set(!this.isAddCaptionDialogOpen);
  }

  onDeleteDialogClosed(hasImageToDelete: boolean) {
    if (!hasImageToDelete) {
      this.isDeleteDialogOpen.set(!this.isDeleteDialogOpen());
      return;
    }

    this.store.deleteImage({
      mapId: this.mapId,
      markerId: this.markerId,
      imageId: this.images()[this.focusedImagedIndex()!].imageId,
    });

    this.isDeleteDialogOpen.set(!this.isDeleteDialogOpen());
    this.focusedImagedIndex.set(null);
  }

  ngAfterViewInit() {
    const displayCaptionDialogClosed$ = outputToObservable(
      this.displayCaptionDialogRef().dialogClosed
    );

    //display caption flow
    displayCaptionDialogClosed$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.isDisplayCaptionDialogOpen.set(
            !this.isDisplayCaptionDialogOpen()
          );
        })
      )
      .subscribe();
  }

  addJournalEntry(hasJournalToAdd: boolean) {
    if (!hasJournalToAdd) {
      this.isJournalEntryDialogOpen.set(!this.isJournalEntryDialogOpen());
      return;
    }

    this.store.updateMarker({
      mapId: this.mapId,
      markerId: this.markerId,
      data: { journal: this.addJournalEntryFormControl.value },
    });

    this.isJournalEntryDialogOpen.set(!this.isJournalEntryDialogOpen());
    // this.addJournalEntryFormControl.setValue('');
  }

  protected fakeImgArray: any[] = [];
  showDeleteDialog = false;
  showCaptionDialog = false;

  lightboxConfig: LightboxConfig = {
    isVisible: false,
    openAtIndex: 0,
  };
}
