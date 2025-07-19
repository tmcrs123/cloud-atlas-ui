import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: "root" })
export class GoogleMapsAPIService {
	private loader = new Loader({
		apiKey: `${environment.google_maps_api_key}`,
	});

	public async load() {
		await this.loader.importLibrary("maps");
	}
}
