import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.component.html',
  styles: ``,
})
export class LandingComponent {
  private auth = inject(AuthService);

  ngOnInit() {
    this.auth.checkIfUserIsAuthenticated().subscribe((t) => {
      console.log(t);
    });
  }
}
