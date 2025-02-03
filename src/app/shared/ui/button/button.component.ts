import { CommonModule } from '@angular/common';
import { Component, computed, effect, HostBinding, HostListener, inject, input, output } from '@angular/core';
import { ARROW_BACK_SVG, ARROW_DOWN_SVG, ARROW_ON_SQUARE_UP_SVG, GLOBE_SVG, LIST_SVG, PENCIL_SVG, PLUS_SVG, SPEECH_BUBBLE_SVG, WARNING_SVG } from './button.svg';
import { DomSanitizer } from '@angular/platform-browser';

export type ButtonConfig = {
  type: 'add' | 'delete' | 'secondary_action' | 'primary_action' | 'accent';
  svg?: 'globe' | 'arrow_down' | 'plus' | 'list' | 'arrow_back' | 'speech_bubble' | 'warning' | 'arrow_on_square_up' | 'pencil' | null;
  text: string;
  customCss?: string;
  disabled?: boolean;
};

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly deleteButtonCss = 'bg-red-600 text-white hover:bg-red-700 focus:outline-none shadow-md cursor-pointer font-bold text-lg flex flex-row items-center content-center justify-center p-4 disabled:opacity-50 disabled:cursor-not-allowed';
  readonly primaryActionButtonCss = 'bg-sky-600 text-white hover:bg-sky-700 focus:outline-none shadow-md cursor-pointer font-bold text-lg flex flex-row items-center content-center justify-center p-4 disabled:opacity-50 disabled:cursor-not-allowed';
  readonly secondaryActionButtonCss = 'bg-gray-400 text-white hover:bg-gray-500 focus:outline-none shadow-md cursor-pointer font-bold text-lg flex flex-row items-center content-center justify-center p-4 disabled:opacity-50 disabled:cursor-not-allowed';
  readonly addButtonCss = 'bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none shadow-md cursor-pointer font-bold text-lg flex flex-row items-center content-center justify-center p-4 disabled:opacity-50 disabled:cursor-not-allowed';
  readonly disabledButtonCss = 'bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none shadow-md font-bold text-lg flex flex-row items-center content-center justify-center p-4 disabled:opacity-50 disabled:cursor-not-allowed';

  config = input.required<ButtonConfig>();
  btnClick = output<void>();
  buttonType = computed(() => {
    switch (this.config().type) {
      case 'add':
        return this.addButtonCss;
      case 'delete':
        return this.deleteButtonCss;
      case 'secondary_action':
        return this.secondaryActionButtonCss;
      case 'primary_action':
      default:
        return this.primaryActionButtonCss;
    }
  });
  svgIcon = computed(() => {
    if (!this.config().svg) return null;

    switch (this.config().svg) {
      case 'globe':
        return this.sanitizer.bypassSecurityTrustHtml(GLOBE_SVG);
      case 'arrow_down':
        return this.sanitizer.bypassSecurityTrustHtml(ARROW_DOWN_SVG);
      case 'arrow_back':
        return this.sanitizer.bypassSecurityTrustHtml(ARROW_BACK_SVG);
      case 'plus':
        return this.sanitizer.bypassSecurityTrustHtml(PLUS_SVG);
      case 'list':
        return this.sanitizer.bypassSecurityTrustHtml(LIST_SVG);
      case 'speech_bubble':
        return this.sanitizer.bypassSecurityTrustHtml(SPEECH_BUBBLE_SVG);
      case 'warning':
        return this.sanitizer.bypassSecurityTrustHtml(WARNING_SVG);
      case 'arrow_on_square_up':
        return this.sanitizer.bypassSecurityTrustHtml(ARROW_ON_SQUARE_UP_SVG);
      case 'pencil':
        return this.sanitizer.bypassSecurityTrustHtml(PENCIL_SVG);
      default:
        return null;
    }
  });

  @HostBinding('attr.tabindex') get tabindex() {
    return 0;
  }

  @HostListener('keydown.enter', ['$event']) handleEnterPress(event: KeyboardEvent) {
    this.btnClick.emit();
  }
}
