import { Component, computed, effect, EffectRef, ElementRef, inject, input, output, Renderer2, signal, viewChild, viewChildren, ViewContainerRef } from '@angular/core';
import { MarkerImage } from '../../../shared/models/marker-image';
import { ButtonComponent, ButtonConfig } from '../../../shared/ui/button/button.component';
import { DropdownComponent, DropdownConfig } from '../../../shared/ui/dropdown/dropdown.component';
import { LightboxComponent } from '../../../shared/ui/lightbox/lightbox.component';
import { DISPLAY_CAPTION_BUTTON_CONFIG, DROPDOWN_CONFIG } from '../marker-detail/marker-detail-config';

@Component({
    standalone: true,
    imports: [DropdownComponent, ButtonComponent, LightboxComponent],
    selector: 'app-image-gallery',
    templateUrl: './image-gallery.component.html',
    styleUrl: './image-gallery.component.css'
})

export class ImageGalleryComponent {
    protected readonly displayCaptionButtonConfig: ButtonConfig = DISPLAY_CAPTION_BUTTON_CONFIG
    protected readonly dropdownConfig: DropdownConfig = DROPDOWN_CONFIG
    protected focusedImageIndex = 0
    private effectExecuted = false;

    protected btnClick = output<number>()
    protected optionSelected = output<{ optionIndex: number, imageIndex: number }>()
    public images = input.required<MarkerImage[]>()


    public allImages = viewChildren<HTMLImageElement, ElementRef>('img', { read: ElementRef })
    public imagesContainerElement = viewChild.required('imagesContainer', { read: ElementRef })
    public projectedImage = viewChild.required('injectImage', { read: ElementRef })

    protected htmlImageElements: HTMLImageElement[] = [];
    protected isLightboxOpen = signal(false)
    public loadedImages = signal<{ [id: string]: boolean }>({})

    public renderer = inject(Renderer2)
    public hostVcr = inject(ViewContainerRef)

    protected groupedImages = computed(() => {
        console.log('grouped images signal...');
        return this.groupImages(this.images()).map(details => {
            if (this.isMobile()) {
                return { url: details.mobile, id: details.id, legend: details.legend }
            } else {
                return { url: details.desktop, id: details.id, legend: details.legend }
            }
        });
    })

    constructor() {

        effect(() => {
            console.log('images', this.images());
        })

        effect(() => {
            console.log('loaded', this.loadedImages());
        })

        effect(() => {
            console.log('grouped', this.groupedImages());
        })

        effect(() => {
            if (!this.effectExecuted && Object.values(this.loadedImages()).length === this.groupedImages().length) {
                this.renderer.removeChild(this.hostVcr.element.nativeElement, this.hostVcr.element.nativeElement.firstChild)
                this.imagesContainerElement().nativeElement.style.opacity = '1'
                this.effectExecuted = true;
            }
        })
    }

    protected imageLoaded(id: string) {
        console.log('image ', id, 'loaded');
        this.loadedImages.update(s => ({ ...s, [id]: true }))
    }

    isMobile(): boolean {
        return true;
        // return window.matchMedia('(max-width: 768px)').matches;
    }

    updateFocusedImageIndex(action: 'next' | 'prev') {
        if (action === 'next') {
            this.focusedImageIndex = this.focusedImageIndex + 1 >= this.groupedImages().length ? 0 : this.focusedImageIndex + 1;
        } else {
            this.focusedImageIndex = this.focusedImageIndex - 1 >= 0 ? this.focusedImageIndex - 1 : this.groupedImages().length - 1;
        }
    }

    onClose() {
        this.isLightboxOpen.set(false)
        this.focusedImageIndex = 0;
    }

    onImageClicked(imageIndex: number, clickEvent: Event) {
        this.focusedImageIndex = imageIndex;
        this.isLightboxOpen.set(true)
    }

    private groupImages(images: MarkerImage[]) {
        const grouped: { [key: string]: { id: string, desktop: string, mobile: string, legend?: string } } = {}

        images.forEach(({ id: id, url, legend }) => {
            // Remove "_desktop" or "_mobile" from the imageId to get the base ID
            const baseId = id.replace(/_(desktop|mobile)$/, '');
            const type = id.includes('_desktop') ? 'desktop' : 'mobile';

            if (!grouped[baseId]) {
                grouped[baseId] = { id: baseId, desktop: '', mobile: '', legend };
            }

            grouped[baseId][type] = url;
        });

        return Object.values(grouped);
    }
}