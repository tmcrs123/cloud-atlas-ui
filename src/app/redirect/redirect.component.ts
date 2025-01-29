import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirect',
  imports: [],
  templateUrl: './redirect.component.html',
  styleUrl: './redirect.component.css',
})
export class RedirectComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.auth.exchangeCodeForToken().subscribe({
      next: () => {
        this.router.navigateByUrl('maps');
      },
      complete: () => {
        alert('auth finished');
      },
    });
  }
}
