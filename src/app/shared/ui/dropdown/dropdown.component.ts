import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import {
  Component,
  contentChild,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  outputToObservable,
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import { fromEvent, merge, tap } from 'rxjs';

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
  isDropdownOpen = signal(false);
  destroyRef = inject(DestroyRef);
  config = input.required<DropdownConfig>();
  selectedOption = output<number>();
  dropdownButton =
    contentChild<ElementRef<HTMLButtonElement>>('dropdownButton');

  ngAfterContentInit() {
    merge(
      fromEvent<Event>(this.dropdownButton()?.nativeElement!, 'click'),
      outputToObservable(this.selectedOption)
    )
      .pipe(
        tap(() => this.isDropdownOpen.set(!this.isDropdownOpen())),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}
