import { Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { bufferCount, catchError, from, map, mergeMap, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ImagesService } from '../../../images/data-access/images-service';
import { BannerService } from '../../../shared/services/banner-service';
import { ButtonComponent, type ButtonConfig } from '../../../shared/ui/button/button.component';
import { AppStore } from '../../../store/store';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  imports: [ButtonComponent, NgIf],
  templateUrl: './image-upload.component.html',
})
export class ImageUploadComponent {
  // inject
  bannerService = inject(BannerService);
  imagesService = inject(ImagesService);
  store = inject(AppStore);

  // signals
  atlasId = input('');
  buttonConfig = input<ButtonConfig>();
  isDesktop = input(false);
  markerId = input('');
  canAddImages = computed(() => {
    return this.store.getImagesForMarker(this.atlasId(), this.markerId())().length < Number.parseInt(environment.images_limit);
  });
  markerCurrentImageCount = computed(() => this.store.getImagesForMarker(this.atlasId(), this.markerId())().length);
  dataTestId = computed(() => `file-upload-${this.isDesktop() ? 'desktop' : 'mobile'}`)
  addNewImageButtonConfig = linkedSignal<ButtonConfig>(() => {
    return {
      text: 'Add new image',
      type: 'secondary_action',
      svg: 'arrow_on_square_up',
      disabled: !this.canAddImages(),
      ...this.buttonConfig(),
    };
  });

  constructor() {
    effect(() => {
      if (!this.store.imageUploadInProgress()) {
        this.addNewImageButtonConfig.update((state) => ({ ...state, disabled: false }));
        this.bannerService.dismissManually();
      }
    });
  }

  handleFileUpload(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (!files || files.length > 10) {
      inputElement.value = '';
      throw new Error('Only 10 files allowed per upload. ⚠');
    }
    const imageCount = this.store.getImagesForMarker(this.atlasId(), this.markerId())().length;
    if (imageCount + files.length > Number.parseInt(environment.images_limit)) {
      throw new Error(`You are going over the limit of 25 images. You can only upload ${Number.parseInt(environment.images_limit) - imageCount} more images🗻`);
    }

    from(files)
      .pipe(
        tap(() => {
          this.bannerService.setMessage(
            {
              message: 'Processing your photos, this can take up to 30 seconds. Please wait 😇',
              type: 'info',
            },
            -1,
            true
          );
          this.addNewImageButtonConfig.update((state) => ({ ...state, disabled: true }));
        }),
        mergeMap((file) =>
          this.fileValidations$(file).pipe(
            mergeMap((file) => this.pushFileToS3(file)),
            catchError((error: string) => {
              this.addNewImageButtonConfig.update((state) => ({ ...state, disabled: false }));
              return throwError(() => new Error(error));
            })
          )
        ),
        bufferCount(files.length),
        map(() => files.length)
      )
      .subscribe({
        complete: () => {
          this.bannerService.setMessage(
            {
              message: 'Finished processing, now retrieving your photos 📷',
              type: 'info',
            },
            -1,
            true
          );
          this.store.poolForImages({
            atlasId: this.atlasId(),
            markerId: this.markerId(),
            targetCount: this.markerCurrentImageCount() + files.length,
          });
        },
      });
  }

  private pushFileToS3(file: File) {
    const extension = file.name.split('.').pop() || '';
    const name = `${crypto.randomUUID()}.${extension}`;
    
    return this.imagesService.createPresignedURL(this.atlasId(), this.markerId(), name).pipe(
      mergeMap((url) => {
        return this.imagesService.pushToS3Bucket(url, file);
      }),
      catchError((_error) => throwError(() => `Error sending ${file.name} to images repository`))
    );
  }

  private fileValidations$ = (file: File) => {
    const fileReader = new FileReader();
    return new Observable<File>((subscriber) => {
      if (!this.validFileSize(file)) {
        subscriber.error(`File ${file.name} exceeds limit of 20mb`);
      }

      if (!this.validFileType(file)) {
        subscriber.error(`File ${file.name} is not an image`);
      }

      fileReader.readAsDataURL(file);

      fileReader.onload = (_event: ProgressEvent) => {
        subscriber.next(file);
        subscriber.complete();
      };

      fileReader.onerror = (_err) => {
        subscriber.error(`There was an error reading file ${file.name}`);
        //clear listeners just in case
        fileReader.onload = null;
        fileReader.onerror = null;
      };
    });
  };

  private validFileSize(file: File) {
    if (file.size > Number.parseInt(environment.max_image_file_size_in_bytes)) return false;
    return true;
  }

  private validFileType(file: File) {
    return file.type.match(/image\/*/) !== null;
  }
}
