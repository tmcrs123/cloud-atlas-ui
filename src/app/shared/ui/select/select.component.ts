import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select',
  imports: [CommonModule, FormsModule],
  templateUrl: './select.component.html',
})
export default class SelectComponent {
  public selectedOption: string = '';
  destinations: string[] = ['Paris', 'New York', 'Tokyo', 'Sydney', 'London'];
}
