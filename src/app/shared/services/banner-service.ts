import { Injectable, signal } from '@angular/core';
import { BannerNotification } from '../models/banner-notification';
import { EMPTY, filter, iif, of, switchMap, take, tap, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  public latestNotification = signal<BannerNotification | null>(null);

  public setMessage(notification: BannerNotification, timeout: number = 5000, dismissManually = false) {
    of(null)
      .pipe(
        tap(() => this.latestNotification.set(notification)),
        switchMap(() => {
          if (dismissManually) {
            return EMPTY;
          } else return timer(timeout).pipe(tap(() => this.latestNotification.set(null)));
        }),
        take(1)
      )
      .subscribe();
  }

  public dismissManually() {
    this.latestNotification.set(null);
  }
}
