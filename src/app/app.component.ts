import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { EnvironmentVariablesService } from './shared/services/environment-variables.service';
import { LoaderService } from './shared/services/loader.service';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';
import { BannerComponent } from './shared/ui/notification-banner/notification-banner.component';
import { AppStore } from './store/store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, NavbarComponent, BannerComponent],
  providers: [AppStore],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  loaderService = inject(LoaderService);
  env = inject(EnvironmentVariablesService);

  title = `Cloud-Atlas=${this.env.getEnvironmentValue('environment_name')}`;
}