import { Component, computed, ElementRef, inject, input, output, Renderer2, signal, viewChild, viewChildren, ViewContainerRef } from '@angular/core';
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
    public images = input.required<MarkerImage[]>()
    protected groupedImages = computed(() => this.groupImages(this.images()))
    public imagesContainerElement = viewChild.required('imagesContainer', { read: ElementRef })
    public imageContainer = viewChildren('imageContainer', { read: ElementRef })
    public imagesContainerRef = viewChild.required('imagesContainer', { read: ViewContainerRef })
    public projectedImage = viewChild.required('injectImage', { read: ElementRef })
    public hostVcr = inject(ViewContainerRef)
    public renderer = inject(Renderer2)
    protected readonly dropdownConfig: DropdownConfig = DROPDOWN_CONFIG
    protected readonly displayCaptionButtonConfig: ButtonConfig = DISPLAY_CAPTION_BUTTON_CONFIG
    protected isLightboxOpen = signal(false)
    protected htmlImageElements: HTMLImageElement[] = [];

    protected optionSelected = output<{ optionIndex: number, imageIndex: number }>()
    protected btnClick = output<number>()

    protected emit(optionIndex: number, imageIndex: number) {
        this.optionSelected.emit({ optionIndex, imageIndex })
    }

    protected focusedImageIndex = 0

    onImageClicked(imageIndex: number) {
        this.focusedImageIndex = imageIndex;
        this.renderer.appendChild(this.projectedImage().nativeElement, this.htmlImageElements[imageIndex].cloneNode(true))
        this.isLightboxOpen.set(true)
    }

    updateFocusedImageIndex(action: 'next' | 'prev') {
        if (action === 'next') {
            this.focusedImageIndex = this.focusedImageIndex + 1 >= this.groupedImages().length ? 0 : this.focusedImageIndex + 1;
        } else {
            this.focusedImageIndex = this.focusedImageIndex - 1 >= 0 ? this.focusedImageIndex - 1 : this.groupedImages().length - 1;
        }
        this.renderer.removeChild(this.projectedImage().nativeElement, this.projectedImage().nativeElement.firstChild)
        this.renderer.appendChild(this.projectedImage().nativeElement, this.htmlImageElements[this.focusedImageIndex].cloneNode(true))
    }

    onClose() {
        this.isLightboxOpen.set(false)
        this.renderer.removeChild(this.projectedImage().nativeElement, this.projectedImage().nativeElement.firstChild)
    }


    ngAfterViewInit() {
        let images = 0
        this.imagesContainerElement().nativeElement.style.opacity = '0'
        this.imagesContainerElement().nativeElement.style.transition = 'opacity 1s ease-in-out'

        this.groupedImages().forEach((imgDetails, index) => {
            const img = this.renderer.createElement('img') as HTMLImageElement
            this.htmlImageElements.push(img)

            img.style.cursor = 'pointer'

            // img.setAttribute('loading', 'lazy')
            img.setAttribute('tabindex', '0');

            img.src = imgDetails.desktop
            img.srcset = `
            ${imgDetails.mobile} 720w,
            `
            img.onclick = () => {
                this.onImageClicked(index)
            }
            img.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    this.onImageClicked(index)
                }
            }


            img.onload = () => {
                img.style.opacity = '1'
                images += 1

                if (images === this.groupedImages().length) {
                    this.imagesContainerElement().nativeElement.style.opacity = '1'
                    this.imagesContainerElement().nativeElement.style.display = 'block'
                    this.renderer.removeChild(this.hostVcr.element.nativeElement, this.hostVcr.element.nativeElement.firstChild)

                }
            }
            this.renderer.appendChild(this.imageContainer()[index].nativeElement, img)

        });
    }

    private groupImages(images: MarkerImage[]) {
        const grouped: { [key: string]: { id: string, desktop: string, mobile: string } } = {}

        images.forEach(({ imageId, url }) => {
            // Remove "_desktop" or "_mobile" from the imageId to get the base ID
            const baseId = imageId.replace(/_(desktop|mobile)$/, '');
            const type = imageId.includes('_desktop') ? 'desktop' : 'mobile';

            if (!grouped[baseId]) {
                grouped[baseId] = { id: baseId, desktop: '', mobile: '' };
            }

            grouped[baseId][type] = url;
        });

        return Object.values(grouped);
    }
}