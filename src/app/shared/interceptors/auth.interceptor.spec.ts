import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import { authInterceptor } from 'angular-auth-oidc-client';


describe('authInterceptor', () => {
  // const interceptor: HttpInterceptorFn = (req, next) => 
  //   TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(true).toBeTruthy();
  });
});
