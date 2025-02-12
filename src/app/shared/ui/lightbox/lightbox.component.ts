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
  lightboxContainer = viewChild.required('lightboxContainer', {
    read: ElementRef,
  });
  private swipeCoord: [number, number];
  private swipeTime: number;

  swipe(e: TouchEvent, when: string) {
    const coord: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    const time = new Date().getTime();

    if (when === 'start') {
      this.swipeCoord = coord;
      this.swipeTime = time;
    } else if (when === 'end') {
      const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
      const duration = time - this.swipeTime;

      if (
        duration < 1000 && //
        Math.abs(direction[0]) > 30 && // Long enough
        Math.abs(direction[0]) > Math.abs(direction[1] * 3)
      ) {
        // Horizontal enough
        const swipe = direction[0] < 0 ? 'next' : 'previous';
        swipe === 'next' ? this.onNext() : this.onPrev();
      }
    }
  }

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
