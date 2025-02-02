import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class LandingComponent {
  private auth = inject(AuthService);

  ngOnInit() {
    this.auth.checkIfUserIsAuthenticated().subscribe();
  }
}
