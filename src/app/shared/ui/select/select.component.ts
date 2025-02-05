import { CommonModule } from '@angular/common';
import { Component, forwardRef, input } from '@angular/core';
import { type ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { WarningBannerComponent } from '../warning-banner/warning-banner.component';

export type SelectOption<T> = {
  title: string;
  value: T;
};

@Component({
  selector: 'app-select',
  imports: [CommonModule, FormsModule, WarningBannerComponent],
  templateUrl: './select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent<T> implements ControlValueAccessor {
  public options = input.required<SelectOption<T>[]>();
  public selectedOption!: T;

  private onChange: (value: T) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: T): void {
    this.selectedOption = value;
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onSelect(value: T) {
    this.selectedOption = value;
    this.onChange(value);
    this.onTouched();
  }

  onBlur() {
    this.onTouched();
  }
}
