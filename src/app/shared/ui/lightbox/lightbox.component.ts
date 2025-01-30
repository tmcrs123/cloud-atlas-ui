import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent, tap } from 'rxjs';
import { Image } from '../../models';
export interface LightboxConfig {
  displayCount: boolean;
  displayControls: boolean;
  slideshowMode: boolean;
  openAtIndex: number;
  isVisible: boolean;
  images: Image[];
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
  close = output<void>();
  currentIndex = signal<number>(0);
  lightboxContainer = viewChild.required('lightboxContainer', {
    read: ElementRef,
  });

  ngAfterViewInit() {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        tap(() => console.log('evemt')),
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          event?.preventDefault();
          event?.stopPropagation();
        }),
        filter(() => !this.lightboxConfig().slideshowMode),
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

  closeLb() {
    this.close.emit();
  }

  protected onPrev() {
    let newIndex =
      this.currentIndex() - 1 >= 0
        ? this.currentIndex() - 1
        : this.lightboxConfig().images.length - 1;
    this.currentIndex.set(newIndex);
  }

  protected onNext() {
    let newIndex =
      this.currentIndex() + 1 >= this.lightboxConfig().images.length
        ? 0
        : this.currentIndex() + 1;
    this.currentIndex.set(newIndex);
  }
}
