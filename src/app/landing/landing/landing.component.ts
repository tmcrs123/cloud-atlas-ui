import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-landing',
  imports: [],
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
  protected auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // this.auth
    //   .checkIfUserIsAuthenticated()
    //   .subscribe(console.log);
  }

  navigate() {
    if (this.auth.isAuthenticated()) this.router.navigate(['maps']);
    else this.auth.login();
  }
}
