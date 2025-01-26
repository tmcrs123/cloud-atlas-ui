import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

type DropdownConfig = {
  buttonText: string;
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
  config = input.required<DropdownConfig>();
  selectedOption = output<number>();
  isDropdownOpen = false;
}
