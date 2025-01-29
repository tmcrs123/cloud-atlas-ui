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
import { filter, iif, merge, of, switchMap, tap } from 'rxjs';
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
  return `https://picsum.photos/seed/${getRandomLetters()}/${getRandomNumber()}/${getRandomNumber()}`;
}

@Component({
  selector: 'app-marker-detail',
  imports: [LightboxComponent, DropdownComponent, DialogComponent],
  templateUrl: './marker-detail.component.html',
  styleUrl: './marker-detail.component.css',
})
export default class MarkerDetailComponent {
  protected deleteDialogConfig: CustomDialogConfig = {
    data: {
      confirmButtonText: 'Delete',
      title: 'Delete image',
      isDeleteDialog: true,
    },
    primaryActionButtonConfig: {
      text: 'Delete image',
      type: 'delete',
    },
    secondaryActionButtonConfig: {
      text: 'Cancel',
      type: 'secondary_action',
    },
  };

  protected readonly captionDialogConfig: CustomDialogConfig = {
    data: {
      confirmButtonText: 'Add',
      title: 'Add caption for image',
      isDeleteDialog: false,
    },
    primaryActionButtonConfig: {
      text: 'Add marker',
      type: 'add',
    },
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
      svg: 'arrow_down',
      customCss:
        'rounded-full bg-sky-600 text-white hover:bg-sky-700 focus:outline-none shadow-md cursor-pointer p-1',
    },
  };

  protected isDeleteDialogOpen = signal(false);
  protected isCaptionDialogOpen = signal(false);
  protected deleteDialogRef =
    viewChild.required<DialogComponent>('deleteDialog');
  protected captionDialogRef =
    viewChild.required<DialogComponent>('captionDialog');
  protected dropdowns = viewChildren(DropdownComponent);
  destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.fakeImgArray = Array(20)
      .fill('')
      .map(() => buildRandomSeed());
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
      tap(() => this.isCaptionDialogOpen.set(true))
    );

    const deleteDialogClosed$ = outputToObservable(
      this.deleteDialogRef().dialogClosed
    );
    const captionDialogClosed$ = outputToObservable(
      this.captionDialogRef().dialogClosed
    );

    //replace with proper htpp method
    const deleteImage$ = of(true);
    const saveCaption$ = of(true);

    //caption flow
    captionOptionSelected$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => captionDialogClosed$),
        switchMap((complete) =>
          iif(() => complete, saveCaption$, of(null)).pipe(
            tap(() => this.isCaptionDialogOpen.set(false))
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
