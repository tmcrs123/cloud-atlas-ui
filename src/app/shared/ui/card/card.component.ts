import { Component, input } from '@angular/core';

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
}
