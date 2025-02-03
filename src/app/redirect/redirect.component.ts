import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { AppStore } from '../store/store';
import { timer } from 'rxjs';
import { GoogleMapsLoaderService } from '../shared/services/google-maps-api.service';

@Component({
  selector: 'app-redirect',
  imports: [],
  templateUrl: './redirect.component.html',
  styleUrl: './redirect.component.css',
})
export class RedirectComponent {
  private auth = inject(AuthService);
  private googleMapsLoader = inject(GoogleMapsLoaderService);
  private store = inject(AppStore);
  private router = inject(Router);

  ngOnInit() {
    this.auth.exchangeCodeForToken().subscribe({
      next: () => {
        this.googleMapsLoader.loadGoogleMapsScript();
        this.store.loadMaps();
        this.router.navigateByUrl('maps');
      },
    });
  }
}
