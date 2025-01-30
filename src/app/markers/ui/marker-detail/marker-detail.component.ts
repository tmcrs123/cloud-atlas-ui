import {
  Component,
  DestroyRef,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import {
  outputToObservable,
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { filter, iif, merge, of, switchMap, tap } from 'rxjs';
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

function getRandomLetters() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 3; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

function getRandomNumber() {
  return Math.floor(Math.random() * (1200 - 600 + 1)) + 600;
}

function buildRandomSeed() {
  // return `https://picsum.photos/seed/${getRandomLetters()}/${getRandomNumber()}/${getRandomNumber()}`;
  return `https://picsum.photos/seed/${getRandomLetters()}/${1200}/${1400}`;
}

@Component({
  selector: 'app-marker-detail',
  imports: [
    LightboxComponent,
    DropdownComponent,
    DialogComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './marker-detail.component.html',
  styleUrl: './marker-detail.component.css',
})
export default class MarkerDetailComponent {
  protected deleteDialogConfig: CustomDialogConfig = {
    title: 'Delete image',
    isDeleteDialog: true,
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
    title: 'Add caption for image',
    isDeleteDialog: false,
    primaryActionButtonConfig: {
      text: 'Add marker',
      type: 'add',
    },
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };

  protected readonly addJournalEntryDialogConfig: CustomDialogConfig = {
    title: 'Add journal entry',
    isDeleteDialog: false,
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
    isDeleteDialog: false,
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };

  protected dropdownConfig: DropdownConfig = {
    options: [
      { label: 'Add caption', index: 0 },
      { label: 'Delete', index: 1 },
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

  protected isDeleteDialogOpen = signal(false);
  protected isAddCaptionDialogOpen = signal(false);
  protected isDisplayCaptionDialogOpen = signal(false);
  protected isJournalEntryDialogOpen = signal(false);
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
  protected addJournalEntryFormControl = new FormControl<string>('', {
    nonNullable: true,
  });

  handleClick(imgIndex: number) {
    this.isDisplayCaptionDialogOpen.set(!this.isDisplayCaptionDialogOpen());
  }

  ngOnInit() {
    this.fakeImgArray = Array(20)
      .fill('')
      .map(() => buildRandomSeed());

    this.addJournalEntryFormControl.valueChanges.subscribe(console.log);
  }

  ngAfterViewInit() {
    let optionSelectedObservables = this.dropdowns().map((dd) =>
      outputToObservable(dd.selectedOption)
    );

    const optionSelected$ = merge(...optionSelectedObservables);

    const deleteOptionSelected$ = optionSelected$.pipe(
      filter((v) => v === 1),
      tap(() => this.isDeleteDialogOpen.set(true))
    );

    const captionOptionSelected$ = optionSelected$.pipe(
      filter((v) => v === 0),
      tap(() => this.isAddCaptionDialogOpen.set(true))
    );

    const deleteDialogClosed$ = outputToObservable(
      this.deleteDialogRef().dialogClosed
    );
    const addCaptionDialogClosed$ = outputToObservable(
      this.addCaptionDialogRef().dialogClosed
    );
    const displayCaptionDialogClosed$ = outputToObservable(
      this.displayCaptionDialogRef().dialogClosed
    );
    const addJournalEntryDialogClosed$ = outputToObservable(
      this.addJournalEntryDialogRef().dialogClosed
    );

    //replace with proper htpp method
    const deleteImage$ = of(true);
    const saveCaption$ = of(true);

    //add caption flow
    captionOptionSelected$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => addCaptionDialogClosed$),
        switchMap((complete) =>
          iif(() => complete, saveCaption$, of(null)).pipe(
            tap(() => this.isAddCaptionDialogOpen.set(false))
          )
        )
      )
      .subscribe();

    //delete flow
    deleteOptionSelected$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => deleteDialogClosed$),
        switchMap((complete) =>
          iif(() => complete, deleteImage$, of(null)).pipe(
            tap(() => this.isDeleteDialogOpen.set(false))
          )
        )
      )
      .subscribe();

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

    //journal entry flow
    addJournalEntryDialogClosed$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.isJournalEntryDialogOpen.set(!this.isJournalEntryDialogOpen());
        })
      )
      .subscribe();
  }

  protected fakeImgArray: any[] = [];
  showDeleteDialog = false;
  showCaptionDialog = false;

  lightboxConfig: LightboxConfig = {
    displayControls: true,
    displayCount: true,
    isVisible: false,
    openAtIndex: 0,
    slideshowMode: false,
    images: [
      {
        mapId: '',
        markerId: '',
        imageId: '',
        url: buildRandomSeed(),
      },
      {
        mapId: '',
        markerId: '',
        imageId: '',
        url: buildRandomSeed(),
      },
      {
        mapId: '',
        markerId: '',
        imageId: '',
        url: buildRandomSeed(),
      },
      {
        mapId: '',
        markerId: '',
        imageId: '',
        url: buildRandomSeed(),
      },
      {
        mapId: '',
        markerId: '',
        imageId: '',
        url: buildRandomSeed(),
      },
    ],
  };

  updateLbConfig(isVisible: boolean) {
    this.lightboxConfig.isVisible = isVisible;
  }
}
