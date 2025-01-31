import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent, tap } from 'rxjs';
import { Image } from '../../models';
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
  images = input.required<Image[]>();
  close = output<void>();
  currentIndex = signal<number>(0);
  lightboxContainer = viewChild.required('lightboxContainer', {
    read: ElementRef,
  });

  /**
   *
   */
  constructor() {}

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
    let newIndex =
      this.currentIndex() - 1 >= 0
        ? this.currentIndex() - 1
        : this.images().length - 1;
    this.currentIndex.set(newIndex);
  }

  private onNext() {
    let newIndex =
      this.currentIndex() + 1 >= this.images().length
        ? 0
        : this.currentIndex() + 1;
    this.currentIndex.set(newIndex);
  }
}
