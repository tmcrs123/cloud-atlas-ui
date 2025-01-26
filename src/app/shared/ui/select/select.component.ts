import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select',
  imports: [CommonModule, FormsModule],
  templateUrl: './select.component.html',
})
export default class SelectComponent {
  public isDialogOpen = signal(false);
  public selectedOption: string = '';
  destinations: string[] = ['Paris', 'New York', 'Tokyo', 'Sydney', 'London'];
}
