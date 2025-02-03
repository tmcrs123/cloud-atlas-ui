import { TestBed } from '@angular/core/testing';

import { GoogleMapsLoaderService } from './google-maps-api.service';

describe('GoogleMapsApiService', () => {
  let service: GoogleMapsLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleMapsLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
