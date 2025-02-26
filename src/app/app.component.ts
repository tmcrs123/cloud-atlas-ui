import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { LoaderService } from './shared/services/loader.service';
import { BannerComponent } from './shared/ui/notification-banner/notification-banner.component';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';
import { AppStore } from './store/store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, NavbarComponent, BannerComponent],
  providers: [AppStore],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = `Cloud-Atlas=${environment.environmentName}`;

  loaderService = inject(LoaderService);
}
