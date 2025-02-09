import { Component, input } from '@angular/core';

@Component({
  selector: 'app-no-items',
  templateUrl: 'no-items.component.html',
})
export class NoItemsComponent {
  noItemsText = input<string>('');
}
