import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../auth/auth.service";

@Component({
	selector: "app-landing",
	templateUrl: "./landing.component.html",
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

	navigate() {
		this.auth.whoami()
		if (this.auth.isAuthenticated()) this.router.navigate(["list"]);
		else this.auth.login();
	}
}
