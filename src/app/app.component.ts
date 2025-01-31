import { Component, inject, Injector } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AppStore } from './store/store';
import { AuthService } from './auth/auth.service';
import { LoaderService } from './shared/services/loader.service';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';
import { from } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, RouterLink, NavbarComponent],
  providers: [AppStore],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'snappin-ui';

  loaderService = inject(LoaderService);
}
