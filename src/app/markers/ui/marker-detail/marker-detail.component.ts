import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, Signal, signal, viewChild, viewChildren } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Marker, MarkerImage } from '../../../shared/models';
import { ButtonComponent, ButtonConfig } from '../../../shared/ui/button/button.component';
import { CustomDialogConfig, DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import DropdownComponent, { DropdownConfig } from '../../../shared/ui/dropdown/dropdown.component';
import { LightboxComponent, LightboxConfig } from '../../../shared/ui/lightbox/lightbox.component';
import { WarningBannerComponent } from '../../../shared/ui/warning-banner/warning-banner.component';
import { AppStore } from '../../../store/store';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { ADD_CAPTION_DIALOG_CONFIG, ADD_JOURNAL_ENTRY_BUTTON_CONFIG, ADD_JOURNAL_ENTRY_DIALOG_CONFIG, DELETE_DIALOG_CONFIG, DISPLAY_CAPTION_BUTTON_CONFIG, DISPLAY_CAPTION_DIALOG_CONFIG, DROPDOWN_CONFIG, LIGHTBOX_CONFIG } from './marker-detail-config';

@Component({
  selector: 'app-marker-detail',
  imports: [LightboxComponent, DropdownComponent, DialogComponent, ButtonComponent, ReactiveFormsModule, WarningBannerComponent, ImageUploadComponent, RouterLink, CommonModule],
  templateUrl: './marker-detail.component.html',
  styles: `.images-container {
    column-count: 3;
  }
  
  @media only screen and (max-width: 500px) {
    .images-container {
      column-count: 1;
    }
  }
  `,
})
export default class MarkerDetailComponent {
  // Configs
  protected readonly addCaptionDialogConfig = ADD_CAPTION_DIALOG_CONFIG;
  protected readonly addJournalEntryButtonConfig: ButtonConfig = ADD_JOURNAL_ENTRY_BUTTON_CONFIG;
  protected readonly addJournalEntryDialogConfig = ADD_JOURNAL_ENTRY_DIALOG_CONFIG;
  protected readonly deleteDialogConfig = DELETE_DIALOG_CONFIG;
  protected readonly displayCaptionButtonConfig: ButtonConfig = DISPLAY_CAPTION_BUTTON_CONFIG;
  protected readonly displayCaptionDialogConfig: CustomDialogConfig = DISPLAY_CAPTION_DIALOG_CONFIG;
  protected readonly dropdownConfig: DropdownConfig = DROPDOWN_CONFIG;

  //Inject
  protected readonly destroyRef = inject(DestroyRef);
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
  protected mapId: string = '';
  protected mapTitle: string;
  protected markerId: string = '';
  protected showCaptionDialog = false;
  protected showDeleteDialog = false;

  // methods
  constructor() {
    effect(() => {
      this.addJournalEntryFormControl.setValue(this.marker().journal);
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
        mapId: this.mapId,
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
      mapId: this.mapId,
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
      mapId: this.mapId,
      markerId: this.markerId,
      data: { journal: this.addJournalEntryFormControl.value },
    });

    this.isJournalEntryDialogOpen.set(!this.isJournalEntryDialogOpen());
    // this.addJournalEntryFormControl.setValue('');
  }
}
