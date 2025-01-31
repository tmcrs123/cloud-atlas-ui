import { Component, inject, input } from '@angular/core';
import { catchError, from, mergeMap, Observable, of, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ImagesService } from '../../../images/data-access/images-service';
import {
  ButtonComponent,
  ButtonConfig,
} from '../../../shared/ui/button/button.component';
import { AppStore } from '../../../store/store';

@Component({
  selector: 'app-image-upload',
  imports: [ButtonComponent],
  templateUrl: './image-upload.component.html',
})
export class ImageUploadComponent {
  protected addNewImageButtonConfig: ButtonConfig = {
    text: 'Add new image',
    type: 'primary_action',
    svg: 'arrow_on_square_up',
  };

  mapId = input('');
  markerId = input('');
  imagesService = inject(ImagesService);
  store = inject(AppStore);

  handleFileUpload(event: Event) {
    console.log(event);

    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (!files || files.length > 10) {
      inputElement.value = '';
      throw new Error('max 10 files allowed');
    }
    from(files)
      .pipe(
        mergeMap((file) =>
          this.fileValidations$(file).pipe(
            mergeMap((file) => this.pushFileToS3(file)),
            catchError((error) => of(`Error processing ${file.name}: ${error}`))
          )
        )
      )
      .subscribe({
        next: console.log,
        complete: () =>
          timer(10000).subscribe({
            next: () => {
              this.store.loadImagesForMarker({
                mapId: this.mapId(),
                markerId: this.markerId(),
              });
            },
          }),
      });
  }

  private pushFileToS3(file: File) {
    return this.imagesService
      .createPresignedURL(this.mapId(), this.markerId())
      .pipe(
        mergeMap((res) => {
          const formData = new FormData();

          Object.keys(res.fields).forEach((key) => {
            formData.append(key, res.fields[key]);
          });

          formData.append('file', file);
          return this.imagesService.pushToS3Bucket(res.url, formData);
        }),
        catchError((error) => of(`Error sending ${file.name} to S3: ${error}`))
      );
  }

  private fileValidations$ = (file: File) => {
    const fileReader = new FileReader();
    return new Observable<File>((subscriber) => {
      if (!this.validFileSize(file)) {
        subscriber.error({
          file: null,
          error: { errorMessage: `File ${file.name} exceeds limit of 10mb` },
        });
      }

      if (!this.validFileType(file)) {
        subscriber.error({
          file: null,
          error: { errorMessage: `File ${file.name} is not an image` },
        });
      }

      fileReader.readAsDataURL(file);

      fileReader.onload = (event: ProgressEvent) => {
        subscriber.next(file);
        subscriber.complete();
      };

      fileReader.onerror = (err) => {
        subscriber.error({
          file: null,
          error: { errorMessage: 'There was an error reading this file.' },
        });
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
