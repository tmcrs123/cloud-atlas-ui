import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected auth = inject(AuthService);
  protected readonly navItemCss =
    'text-zinc-800 text-2xl font-medium px-3 py-2 hover:text-yellow-600 cursor-pointer';
}
