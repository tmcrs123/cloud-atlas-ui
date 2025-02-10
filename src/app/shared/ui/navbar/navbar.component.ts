import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected auth = inject(AuthService);
  protected readonly navItemCss = 'text-zinc-800 text-2xl font-medium hover:text-yellow-600 cursor-pointer';
}
