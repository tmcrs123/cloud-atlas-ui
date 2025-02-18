import { type ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { LandingComponent } from './landing.component'
import { AuthService } from '../../auth/auth.service'
import { MockAuthService } from '../../auth/mock-auth.service'
import { GoogleMapsLoaderService } from '../../shared/services/google-maps-api.service'
import { NavigationEnd, provideRouter, Router } from '@angular/router'
import { AtlasListComponent } from '../../atlas/atlas-list.component'
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs'
import { RedirectComponent } from '../../redirect/redirect.component'
import { AppStore } from '../../store/store'
import { NO_ERRORS_SCHEMA } from '@angular/core'

let harness: RouterTestingHarness;
let fixture: ComponentFixture<LandingComponent>
let component: LandingComponent
let router: Router

async function compileAndCreate() {
  TestBed.configureTestingModule({
    imports: [LandingComponent, RedirectComponent],
    providers: [
      { provide: AuthService, useClass: MockAuthService },
      provideRouter([
        { path: '', component: LandingComponent },
        { path: 'redirect', component: RedirectComponent }
      ])
    ],
    schemas: [NO_ERRORS_SCHEMA],
  })

  router = TestBed.inject(Router)
  TestBed.inject(AppStore)
  TestBed.inject(AuthService)
  TestBed.inject(GoogleMapsLoaderService)
  harness = await RouterTestingHarness.create('/')
  component = await harness.navigateByUrl('/', LandingComponent)

  TestBed.overrideComponent(RedirectComponent, { set: { providers: [{ provide: AuthService, useClass: MockAuthService }] } })

  // fixture = TestBed.createComponent(LandingComponent)
  // component = fixture.componentInstance
}

describe('Landing Page', () => {

  beforeEach(async () => {
    await compileAndCreate()
  })

  it('mounts', () => {
    expect(component).toBeDefined()
  })

  it('navigates the user to atlas-list', fakeAsync(async () => {
    const anchor = harness.fixture.nativeElement.querySelector('#navigate') as HTMLAnchorElement;
    console.log(anchor);
    anchor.click();
    tick()
    harness.detectChanges()
    expect(router.url).toBe('/atlas')


  }))


})

