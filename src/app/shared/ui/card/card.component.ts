import { Component, HostBinding, HostListener, input, output } from '@angular/core';

export type CardConfig = {
  title: string;
  subtitle: string;
};

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
})
export class CardComponent {
  cardConfig = input.required<CardConfig>();
  enterPressed = output<void>();

  @HostBinding('attr.tabindex') get tabindex() {
    return 0;
  }

  @HostListener('keydown.enter', ['$event']) handleEnterPress(event: KeyboardEvent) {
    this.enterPressed.emit();
  }
}
