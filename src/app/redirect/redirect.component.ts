import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleMapsLoaderService } from '../shared/services/google-maps-api.service';
import { AppStore } from '../store/store';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-redirect',
  imports: [],
  templateUrl: './redirect.component.html',
})
export class RedirectComponent {
  private auth = inject(AuthService);
  private googleMapsLoader = inject(GoogleMapsLoaderService);
  private store = inject(AppStore);
  private router = inject(Router);

  ngOnInit() {
    console.log(this.auth.whoami());
    this.auth.exchangeCodeForToken().subscribe({
      next: () => {
        this.googleMapsLoader.load();
        this.store.loadAtlasList();
        this.router.navigateByUrl('list');
      },
    });
  }
}
