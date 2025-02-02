import { Injectable, signal } from '@angular/core';
import { BannerNotification } from '../models/banner-notification';
import { EMPTY, of, switchMap, tap, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  public latestNotification = signal<BannerNotification | null>(null);

  public setMessage(notification: BannerNotification, timeout: number = 5000) {
    of(null)
      .pipe(
        tap(() => this.latestNotification.set(notification)),
        switchMap(() => timer(timeout))
      )
      .subscribe({
        complete: () => {
          this.latestNotification.set(null);
        },
      });
  }
}
