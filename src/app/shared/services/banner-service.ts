import { Injectable, signal } from '@angular/core';
import { EMPTY, of, switchMap, take, tap, timer } from 'rxjs';
import type { BannerNotification } from '../models/banner-notification.js';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  public latestNotification = signal<BannerNotification | null>(null);

  public setMessage(notification: BannerNotification, timeout = 5000, dismissManually = false) {
    of(null)
      .pipe(
        tap(() => this.latestNotification.set(notification)),
        switchMap(() => {
          if (dismissManually) {
            return EMPTY;
          }
          return timer(timeout).pipe(tap(() => this.latestNotification.set(null)));
        }),
        take(1)
      )
      .subscribe();
  }

  public dismissManually() {
    this.latestNotification.set(null);
  }
}
