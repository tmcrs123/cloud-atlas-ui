import { Injectable } from "@angular/core";
import { Loader } from "@googlemaps/js-api-loader";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class GoogleMapsLoaderService {
	private loader = new Loader({
		apiKey: `${environment.googleMapsApiKey}`,
	});

	public async load() {
		await this.loader.importLibrary("maps");
	}
}
