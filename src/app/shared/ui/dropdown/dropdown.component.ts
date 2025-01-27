import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  contentChild,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  outputToObservable,
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  finalize,
  fromEvent,
  Observable,
  race,
  switchMap,
  takeUntil,
  tap,
  timer,
} from 'rxjs';

type DropdownConfig = {
  options: {
    label: string;
    index: number;
  }[];
};

@Component({
  selector: 'app-dropdown',
  imports: [CommonModule, OverlayModule],
  templateUrl: './dropdown.component.html',
})
export default class DropdownComponent {
  isDropdownOpen = false;
  cdr = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);
  config = input.required<DropdownConfig>();
  selectedOption = output<number>();
  dropdownButton =
    contentChild<ElementRef<HTMLButtonElement>>('dropdownButton');
  dropdownDiv = viewChild<ElementRef<HTMLDivElement>>('dropdownDiv');

  ngAfterContentInit() {
    let mouseOverDiv$: Observable<MouseEvent>;
    let mouseOutOfDiv$: Observable<MouseEvent>;
    const wait2Seconds$ = timer(2000);

    outputToObservable(this.selectedOption)
      .pipe(tap(() => (this.isDropdownOpen = false)))
      .subscribe();

    fromEvent<Event>(this.dropdownButton()?.nativeElement!, 'click')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.isDropdownOpen = true;
          this.cdr.detectChanges(); //dropdown div is now visible but needs CDR because it's behind ngIf
          mouseOverDiv$ = fromEvent<MouseEvent>(
            this.dropdownDiv()?.nativeElement!,
            'mouseenter'
          );
          mouseOutOfDiv$ = fromEvent<MouseEvent>(
            this.dropdownDiv()?.nativeElement!,
            'mouseleave'
          );
        }),
        switchMap(() => {
          //either the user enters the DD or it closes
          return race(
            mouseOverDiv$.pipe(
              takeUntil(mouseOutOfDiv$),
              finalize(() => (this.isDropdownOpen = false))
            ),
            wait2Seconds$.pipe(tap(() => (this.isDropdownOpen = false)))
          );
        })
      )
      .subscribe();
  }
}
