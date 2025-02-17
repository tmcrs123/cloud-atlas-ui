import { CommonModule, Location } from '@angular/common';
import { Component, DestroyRef, type Signal, computed, effect, inject, signal, viewChild, viewChildren } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { MarkerImage } from '../../../shared/models/marker-image.js';
import type { Marker } from '../../../shared/models/marker.js';
import { ButtonComponent, type ButtonConfig } from '../../../shared/ui/button/button.component';
import { type CustomDialogConfig, DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import { DropdownComponent, type DropdownConfig } from '../../../shared/ui/dropdown/dropdown.component';
import { LightboxComponent } from '../../../shared/ui/lightbox/lightbox.component';
import { NoItemsComponent } from '../../../shared/ui/no-items/no-items.component';
import { WarningBannerComponent } from '../../../shared/ui/warning-banner/warning-banner.component';
import { AppStore } from '../../../store/store.js';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import {
  ADD_CAPTION_DIALOG_CONFIG,
  ADD_JOURNAL_ENTRY_BUTTON_CONFIG,
  ADD_JOURNAL_ENTRY_DIALOG_CONFIG,
  ADD_JOURNAL_ENTRY_MOBILE_BUTTON_CONFIG,
  DELETE_DIALOG_CONFIG,
  DISPLAY_CAPTION_BUTTON_CONFIG,
  DISPLAY_CAPTION_DIALOG_CONFIG,
  DROPDOWN_CONFIG,
  LIGHTBOX_CONFIG,
  UPLOAD_IMAGES_MOBILE_BUTTON_CONFIG,
} from './marker-detail-config.js';

@Component({
  selector: 'app-marker-detail',
  imports: [LightboxComponent, DropdownComponent, DialogComponent, ButtonComponent, ReactiveFormsModule, WarningBannerComponent, ImageUploadComponent, RouterLink, CommonModule, NoItemsComponent],
  templateUrl: './marker-detail.component.html',
  styles: `.images-container {
    column-count: 3;
  }
  
  @media only screen and (max-width: 500px) {
    .images-container {
      column-count: 1;
    }
  }

  .break-anywhere {
    overflow-wrap: anywhere;
  }
  `,
})
export class MarkerDetailComponent {
  // Configs
  protected readonly addCaptionDialogConfig = ADD_CAPTION_DIALOG_CONFIG;
  protected readonly addJournalEntryButtonConfig: ButtonConfig = ADD_JOURNAL_ENTRY_BUTTON_CONFIG;
  protected readonly addJournalEntryDialogConfig = ADD_JOURNAL_ENTRY_DIALOG_CONFIG;
  protected readonly addJournalEntryMobileButtonConfig: ButtonConfig = ADD_JOURNAL_ENTRY_MOBILE_BUTTON_CONFIG;
  protected readonly deleteDialogConfig = DELETE_DIALOG_CONFIG;
  protected readonly displayCaptionButtonConfig: ButtonConfig = DISPLAY_CAPTION_BUTTON_CONFIG;
  protected readonly displayCaptionDialogConfig: CustomDialogConfig = DISPLAY_CAPTION_DIALOG_CONFIG;
  protected readonly dropdownConfig: DropdownConfig = DROPDOWN_CONFIG;
  protected readonly uploadImagesMobileButtonConfig: ButtonConfig = UPLOAD_IMAGES_MOBILE_BUTTON_CONFIG;

  //Inject
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly location = inject(Location);
  protected readonly route = inject(ActivatedRoute);
  protected readonly store = inject(AppStore);

  //Signals
  protected focusedImagedIndex = signal<number | null>(null);
  protected images: Signal<MarkerImage[]> = signal([]);
  protected isAddCaptionDialogOpen = signal(false);
  protected isDeleteDialogOpen = signal(false);
  protected isDisplayCaptionDialogOpen = signal(false);
  protected isJournalEntryDialogOpen = signal(false);
  protected isLightboxOpen = signal(false);
  protected lightboxConfig = signal(LIGHTBOX_CONFIG);
  protected marker!: Signal<Marker>;
  protected noItemsText = computed(() => {
    let message = '';
    if (!this.marker().journal && this.images().length === 0) {
      message += 'You have no journal entry or images for this map';
      return message;
    }
    if (!this.marker().journal) {
      message += 'You have no journal entry for this map';
      return;
    }

    if (this.images().length === 0) message += 'You have no images for this map';
    return message;
  });

  //VC-CC
  protected addCaptionDialogRef = viewChild.required<DialogComponent>('addCaptionDialog');
  protected addJournalEntryDialogRef = viewChild.required<DialogComponent>('addJournalEntryDialog');
  protected deleteDialogRef = viewChild.required<DialogComponent>('deleteImageDialog');
  protected displayCaptionDialogRef = viewChild.required<DialogComponent>('displayCaptionDialog');
  protected dropdowns = viewChildren(DropdownComponent);

  //Form controls
  protected addCaptionFormControl = new FormControl<string>('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  protected addJournalEntryFormControl = new FormControl<string | undefined>('', {
    nonNullable: true,
  });

  // Properties
  protected atlasId = '';
  protected atlasTitle = '';
  protected markerId = '';
  protected showCaptionDialog = false;
  protected showDeleteDialog = false;

  // methods
  constructor() {
    effect(() => {
      this.addJournalEntryFormControl.setValue(this.marker().journal);
    });
  }
  ngOnInit() {
    this.atlasId = this.route.snapshot.paramMap.get('atlasId')!;
    this.markerId = this.route.snapshot.paramMap.get('markerId')!;
    this.marker = this.store.getMarkerById(this.atlasId, this.markerId);
    this.atlasTitle = this.store.getAtlasById(this.atlasId).title;

    // caching needs to be included here
    this.store.loadImagesForMarker({
      atlasId: this.atlasId,
      markerId: this.markerId,
    });

    this.images = this.store.getImagesForMarker(this.atlasId, this.markerId);
  }

  onLegendButtonClicked(imageIndex: number) {
    this.focusedImagedIndex.set(imageIndex);
    this.isDisplayCaptionDialogOpen.set(!this.isDisplayCaptionDialogOpen());
  }

  onImageClicked(imageIndex: number) {
    this.lightboxConfig.update((state) => ({ ...state, openAtIndex: imageIndex }));
    this.isLightboxOpen.set(true);
  }

  onDropdownOptionSelected(option: number, dropdownIndex: number) {
    this.focusedImagedIndex.set(dropdownIndex);
    if (option) {
      this.isAddCaptionDialogOpen.set(!this.isAddCaptionDialogOpen());
    } else {
      this.isDeleteDialogOpen.set(!this.isDeleteDialogOpen());
    }
  }

  onAddCaptionDialogClose(hasCaptionToAdd: boolean) {
    if (!hasCaptionToAdd) {
      this.addCaptionFormControl.reset('');
      this.isAddCaptionDialogOpen.set(!this.isAddCaptionDialogOpen);

      return;
    }

    this.store.updateImageForMarker({
      data: {
        atlasId: this.atlasId,
        markerId: this.markerId,
        imageId: this.images()[this.focusedImagedIndex()!].imageId,
        legend: this.addCaptionFormControl.value,
      },
    });
    this.isAddCaptionDialogOpen.set(!this.isAddCaptionDialogOpen);
    this.addCaptionFormControl.reset('');
  }

  onDeleteImageDialogClosed(hasImageToDelete: boolean) {
    if (!hasImageToDelete) {
      this.isDeleteDialogOpen.set(!this.isDeleteDialogOpen());
      return;
    }

    this.store.deleteImage({
      atlasId: this.atlasId,
      markerId: this.markerId,
      imageId: this.images()[this.focusedImagedIndex()!].imageId,
    });

    this.isDeleteDialogOpen.set(!this.isDeleteDialogOpen());
    this.focusedImagedIndex.set(null);
  }

  onAddJournalEntryDialogClosed(hasJournalToAdd: boolean) {
    if (!hasJournalToAdd) {
      this.isJournalEntryDialogOpen.set(!this.isJournalEntryDialogOpen());
      return;
    }

    this.store.updateMarker({
      atlasId: this.atlasId,
      markerId: this.markerId,
      data: { journal: this.addJournalEntryFormControl.value },
    });

    this.isJournalEntryDialogOpen.set(!this.isJournalEntryDialogOpen());
  }
}
