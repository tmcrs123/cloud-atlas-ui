import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { testingModuleBaseConfig } from '../../../test/config/config'
import { AuthService } from '../../auth/auth.service'
import { MockAuthService } from '../../auth/mock-auth.service'
import { LandingComponent } from './landing.component'

let fixture: ComponentFixture<LandingComponent>
let router: Router
let authService: AuthService

async function compileAndCreate() {
  TestBed.configureTestingModule({
    imports: [LandingComponent],
    ...testingModuleBaseConfig

  }).compileComponents()

  fixture = TestBed.createComponent(LandingComponent)
  router = TestBed.inject(Router)
  authService = TestBed.inject(AuthService)
}

describe('Landing Page', () => {

  beforeEach(async () => {
    await compileAndCreate()
  })

  it('mounts', () => {
    expect(fixture.componentInstance).toBeDefined()
  })

  it('navigates the user to atlas list if authenticated', () => {
    //setup
    (authService as MockAuthService).setIsAuthenticated(true);

    const routerSpy = jest.spyOn(router, 'navigate')
    const authSpy = jest.spyOn(authService, 'login')
    const anchor = fixture.nativeElement.querySelector('#navigate') as HTMLAnchorElement;

    //Act
    anchor.click();

    //Assert
    expect(authSpy).not.toHaveBeenCalled()
    expect(routerSpy).toHaveBeenCalledWith(['list'])
  })

  it('kicks user to login page if not authenticated', () => {
    //setup
    (authService as MockAuthService).setIsAuthenticated(false);

    const authSpy = jest.spyOn(authService, 'login')
    const anchor = fixture.nativeElement.querySelector('#navigate') as HTMLAnchorElement;

    //Act
    anchor.click();

    //Assert
    expect(authSpy).toHaveBeenCalledTimes(1)
  })
})

