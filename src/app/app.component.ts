import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment.js';
import { LoaderService } from './shared/services/loader.service';
import { BannerComponent } from './shared/ui/notification-banner/notification-banner.component.js';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';
import { AppStore } from './store/store.js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, NavbarComponent, BannerComponent],
  providers: [AppStore],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = `Cloud-Atlas=${environment.name}`;

  loaderService = inject(LoaderService);
}
