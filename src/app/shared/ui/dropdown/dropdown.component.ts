import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input, output, signal, viewChild } from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge, tap } from 'rxjs';
import { ButtonComponent, type ButtonConfig } from '../button/button.component';

export type DropdownConfig = {
  options: {
    label: string;
    index: number;
  }[];
  buttonConfig?: ButtonConfig;
};

@Component({
  selector: 'app-dropdown',
  imports: [CommonModule, OverlayModule, ButtonComponent],
  templateUrl: './dropdown.component.html',
})
export class DropdownComponent {
  isDropdownOpen = signal(false);
  destroyRef = inject(DestroyRef);
  config = input.required<DropdownConfig>();
  optionSelected = output<number>();
  dropdownButton = viewChild.required(ButtonComponent);

  ngAfterContentInit() {
    merge(outputToObservable(this.dropdownButton().btnClick), outputToObservable(this.optionSelected))
      .pipe(
        tap(() => this.isDropdownOpen.set(!this.isDropdownOpen())),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  protected fetchButtonConfig(): ButtonConfig {
    return this.config().buttonConfig as unknown as ButtonConfig;
  }
}
