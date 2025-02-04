import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { bufferCount, catchError, from, mergeMap, Observable, tap, throwError, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ImagesService } from '../../../images/data-access/images-service';
import { BannerService } from '../../../shared/services/banner-service';
import { ButtonComponent, ButtonConfig } from '../../../shared/ui/button/button.component';
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
  mapId = input('');
  markerId = input('');
  canAddImages = computed(() => {
    return this.store.getImagesForMarker(this.mapId(), this.markerId())().length < environment.imagesLimit;
  });
  addNewImageButtonConfig = linkedSignal<ButtonConfig>(() => {
    return {
      text: 'Add new image',
      type: 'primary_action',
      svg: 'arrow_on_square_up',
      disabled: !this.canAddImages(),
    };
  });

  /**
   *
   */
  constructor() {
    effect(() => console.log(this.addNewImageButtonConfig()));
    effect(() => console.log(this.canAddImages()));
  }

  handleFileUpload(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (!files || files.length > 10) {
      inputElement.value = '';
      throw new Error('Only 10 files allowed per upload. ⚠');
    }
    const imageCount = this.store.getImagesForMarker(this.mapId(), this.markerId())().length;
    if (imageCount + files.length > environment.imagesLimit) {
      throw new Error(`You are going over the limit of 25 images. You can only upload ${environment.imagesLimit - imageCount} more images🗻`);
    }

    from(files)
      .pipe(
        tap(() => {
          this.bannerService.setMessage(
            {
              message: 'Processing your images. Please wait ⌚',
              type: 'info',
            },
            11000,
            true
          ),
            this.addNewImageButtonConfig.update((state) => ({ ...state, disabled: true }));
        }),
        mergeMap((file) =>
          this.fileValidations$(file).pipe(
            mergeMap((file) => this.pushFileToS3(file)),
            catchError((error: string) => {
              return throwError(() => new Error(error));
            })
          )
        ),
        bufferCount(files.length)
      )
      .subscribe({
        complete: () =>
          timer(10000).subscribe({
            next: () => {
              this.store.loadImagesForMarker({
                mapId: this.mapId(),
                markerId: this.markerId(),
              });
              this.bannerService.dismissManually();
              this.addNewImageButtonConfig.update((state) => ({ ...state, disabled: false }));
            },
          }),
      });
  }

  private pushFileToS3(file: File) {
    return this.imagesService.createPresignedURL(this.mapId(), this.markerId()).pipe(
      mergeMap((res) => {
        const formData = new FormData();

        Object.keys(res.fields).forEach((key) => {
          formData.append(key, res.fields[key]);
        });

        formData.append('file', file);
        return this.imagesService.pushToS3Bucket(res.url, formData);
      }),
      catchError((error) => throwError(() => `Error sending ${file.name} to images repository`))
    );
  }

  private fileValidations$ = (file: File) => {
    const fileReader = new FileReader();
    return new Observable<File>((subscriber) => {
      if (!this.validFileSize(file)) {
        subscriber.error(`File ${file.name} exceeds limit of 10mb`);
      }

      if (!this.validFileType(file)) {
        subscriber.error(`File ${file.name} is not an image`);
      }

      fileReader.readAsDataURL(file);

      fileReader.onload = (event: ProgressEvent) => {
        subscriber.next(file);
        subscriber.complete();
      };

      fileReader.onerror = (err) => {
        subscriber.error(`There was an error reading file ${file.name}`);
        //clear listeners just in case
        fileReader.onload = null;
        fileReader.onerror = null;
      };
    });
  };

  private validFileSize(file: File) {
    if (file.size > environment.maxImageFileSizeInBytes) return false;
    return true;
  }

  private validFileType(file: File) {
    return file.type.match(/image\/*/) !== null;
  }
}
