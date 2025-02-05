import { Component, DestroyRef, ElementRef, inject, input, linkedSignal, output, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent, tap } from 'rxjs';
import type { MarkerImage } from '../../models/marker-image.js';
export interface LightboxConfig {
  openAtIndex: number;
  isVisible: boolean;
}

const handledKeyboardEvents = ['Escape', 'ArrowRight', 'ArrowLeft'];

@Component({
  selector: 'app-lightbox',
  imports: [],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.css',
})
export class LightboxComponent {
  destroyRef = inject(DestroyRef);
  lightboxConfig = input.required<LightboxConfig>();
  images = input.required<MarkerImage[]>();
  close = output<void>();

  currentIndex = linkedSignal(() => this.lightboxConfig().openAtIndex);
  // currentIndex2 = signal<number>(0);
  lightboxContainer = viewChild.required('lightboxContainer', {
    read: ElementRef,
  });

  ngAfterViewInit() {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          event?.preventDefault();
          event?.stopPropagation();
        }),
        filter((event) => handledKeyboardEvents.includes(event.code)),
        tap((event) => {
          switch (event.code) {
            case 'Escape':
              this.close.emit();
              break;
            case 'ArrowRight':
              this.onNext();
              break;
            case 'ArrowLeft':
              this.onPrev();
              break;
            default:
              break;
          }
        })
      )
      .subscribe();
  }

  private onPrev() {
    const newIndex = this.currentIndex() - 1 >= 0 ? this.currentIndex() - 1 : this.images().length - 1;
    this.currentIndex.set(newIndex);
  }

  private onNext() {
    const newIndex = this.currentIndex() + 1 >= this.images().length ? 0 : this.currentIndex() + 1;
    this.currentIndex.set(newIndex);
  }
}
