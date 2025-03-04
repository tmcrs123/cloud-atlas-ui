import { Component, effect, ElementRef, inject, input, OnInit, output, Renderer2, TemplateRef, viewChild, viewChildren, ViewContainerRef } from '@angular/core';
import { MarkerImage } from '../../../shared/models/marker-image';
import { DropdownComponent, DropdownConfig } from '../../../shared/ui/dropdown/dropdown.component';
import { DISPLAY_CAPTION_BUTTON_CONFIG, DROPDOWN_CONFIG } from '../marker-detail/marker-detail-config';
import { ButtonComponent, ButtonConfig } from '../../../shared/ui/button/button.component';

@Component({
    standalone: true,
    imports: [DropdownComponent, ButtonComponent],
    selector: 'app-image-gallery',
    templateUrl: './image-gallery.component.html',
    styleUrl: './image-gallery.component.css'
})

export class ImageGalleryComponent {
    public images = input.required<MarkerImage[]>()
    public imagesContainerElement = viewChild.required('imagesContainer', { read: ElementRef })
    public imageContainer = viewChildren('imageContainer', { read: ElementRef })
    public imagesContainerRef = viewChild.required('imagesContainer', { read: ViewContainerRef })
    public templateRef = viewChild.required('bananas', { read: TemplateRef })
    public hostVcr = inject(ViewContainerRef)
    public renderer = inject(Renderer2)
    protected readonly dropdownConfig: DropdownConfig = DROPDOWN_CONFIG
    protected readonly displayCaptionButtonConfig: ButtonConfig = DISPLAY_CAPTION_BUTTON_CONFIG
    protected optionSelected = output<{ optionIndex: number, imageIndex: number }>()
    protected btnClick = output<number>()
    protected imageClicked = output<number>()


    protected emit(optionIndex: number, imageIndex: number) {
        this.optionSelected.emit({ optionIndex, imageIndex })
    }

    ngAfterViewInit() {
        let images = 0
        this.imagesContainerElement().nativeElement.style.opacity = '0'
        this.imagesContainerElement().nativeElement.style.transition = 'opacity 1s ease-in-out'

        this.images().forEach((imgDetails, index) => {
            const img = this.renderer.createElement('img') as HTMLImageElement

            img.src = imgDetails.url
            img.setAttribute('loading', 'lazy')
            img.style.cursor = 'pointer'
            img.setAttribute('tabindex', '0');
            img.onclick = () => {
                this.imageClicked.emit(index)
            }
            img.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    this.imageClicked.emit(index)
                }
            }


            img.onload = () => {
                img.style.opacity = '1'
                images += 1

                if (images === this.images().length) {
                    this.imagesContainerElement().nativeElement.style.opacity = '1'
                    this.imagesContainerElement().nativeElement.style.display = 'block'
                    this.renderer.removeChild(this.hostVcr.element.nativeElement, this.hostVcr.element.nativeElement.firstChild)

                }
            }
            this.renderer.appendChild(this.imageContainer()[index].nativeElement, img)

        });
    }
}