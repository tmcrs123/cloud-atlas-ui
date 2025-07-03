import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { MockAuthService } from './mock-auth.service';
import { GoogleMapsAPIService } from '../shared/services/google-maps-api.service';
import { GoogleMapsAPIServiceMock } from '../../test/mocks/google-maps-api.service.mock';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: GoogleMapsAPIService, useClass: GoogleMapsAPIServiceMock }
      ]
    }).compileComponents();

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
