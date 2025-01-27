import {
  Component,
  ElementRef,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import {
  LightboxComponent,
  LightboxConfig,
} from '../../../shared/ui/lightbox/lightbox.component';
import DropdownComponent from '../../../shared/ui/dropdown/dropdown.component';
import {
  CustomDialogConfig,
  DialogComponent,
} from '../../../shared/ui/dialog/dialog.component';
import { DialogConfig } from '@angular/cdk/dialog';
import { outputToObservable, toObservable } from '@angular/core/rxjs-interop';
import {
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  fromEvent,
  iif,
  merge,
  Observable,
  of,
  skip,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';

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
    data: { confirmButtonText: 'Delete', title: 'Delete image' },
  };

  protected readonly addCaptionDialogConfig: CustomDialogConfig = {
    data: {
      confirmButtonText: 'Add',
      title: 'Add caption for image',
    },
  };

  protected isDeleteDialogOpen = signal(false);
  protected deleteDialogRef = viewChild.required(DialogComponent);
  protected dropdowns = viewChildren(DropdownComponent);

  constructor() {
    //start with the DD closed
    // toObservable(this.isDeleteDialogOpen)
    //   .pipe(
    //     switchMap(() =>
    //       outputToObservable(this.deleteDialogRef().dialogClosed)
    //     ),
    //     tap(() => alert('closed'))
    //   )
    //   .subscribe();
  }

  ngOnInit() {
    //actions
    //delete modal open

    //delete modal close - image deleted
    //delete modal close - nothing

    this.fakeImgArray = Array(15)
      .fill('')
      .map(() => buildRandomSeed());
    // console.log(this.fakeImgArray);
  }

  ngAfterViewInit() {
    let optionSelectedObservables = this.dropdowns().map((dd) =>
      outputToObservable(dd.selectedOption)
    );

    const deleteOptionSelected$ = merge(...optionSelectedObservables).pipe(
      filter((v) => v === 1),
      tap(() => this.isDeleteDialogOpen.set(true))
    );

    const deleteDialogClosed$ = outputToObservable(
      this.deleteDialogRef().dialogClosed
    );

    const deleteImage$ = of(true).pipe(tap(() => console.log('delete')));

    deleteOptionSelected$
      .pipe(
        switchMap(() => deleteDialogClosed$),
        switchMap((hasImageToDelete) =>
          iif(() => hasImageToDelete, deleteImage$, of(null)).pipe(
            tap(() => this.isDeleteDialogOpen.set(false))
          )
        )
      )
      .subscribe({
        next: (value) => console.log('next', value),
        complete: () => console.log('complete'),
      });
  }

  protected fakeImgArray: any[] = [];
  showDeleteDialog = false;
  showCaptionDialog = false;

  protected dropdownConfig = {
    options: [
      { label: 'Add caption', index: 0 },
      { label: 'Delete', index: 1 },
    ],
  };

  // onOptionSelected(option: number) {
  //   if (option === 0) this.showCaptionDialog = true;
  //   else
  //     this.deleteDialogConfig = {
  //       ...this.deleteDialogConfig,
  //       data: { ...this.deleteDialogConfig.data, isOpen: true },
  //     };
  // }

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
