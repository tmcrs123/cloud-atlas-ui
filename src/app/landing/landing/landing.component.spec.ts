import {
	type ComponentFixture,
	TestBed,
	waitForAsync,
} from "@angular/core/testing";
import { LandingComponent } from "./landing.component";
import { AuthService } from "../../auth/auth.service";
import { MockAuthService } from "../../auth/mock-auth.service";
import { GoogleMapsLoaderService } from "../../shared/services/google-maps-api.service";

describe("LandingPageComponent", () => {
	let component: LandingComponent;
	let fixture: ComponentFixture<LandingComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [LandingComponent],
			providers: [
				{ provide: AuthService, useClass: MockAuthService },
				// { provide: environment, useValue: environment },
				// { provide: GoogleMapsLoaderService, useValue: { load: () => null } },
			],
		}).compileComponents();
		TestBed.inject(AuthService);
		TestBed.inject(GoogleMapsLoaderService);
		fixture = TestBed.createComponent(LandingComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));
	it("mounts", () => {
		expect(component).toBeDefined();
	});
});
