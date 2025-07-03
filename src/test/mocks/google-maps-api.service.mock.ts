import { Injectable } from "@angular/core";
import { Loader } from "@googlemaps/js-api-loader";

@Injectable({ providedIn: "root" })
export class GoogleMapsAPIServiceMock {
	private loader = new Loader({
		apiKey: 'some_fake_key',
	});

	public async load() { }
}
