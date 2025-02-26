import { ComponentFixture, TestBed } from "@angular/core/testing"
import { testingModuleBaseConfig } from "../../test/config/config"
import { RedirectComponent } from "./redirect.component"
import { GoogleMapsAPIService } from "../shared/services/google-maps-api.service"
import { AppStore } from "../store/store"
import { Router } from "@angular/router"
import { AuthService } from "../auth/auth.service"

describe('Redirect component', () => {

    let fixture: ComponentFixture<RedirectComponent>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RedirectComponent],
            ...testingModuleBaseConfig
        }).compileComponents()

        fixture = TestBed.createComponent(RedirectComponent)
    })

    it('upon receiving auth token, loads google maps, loads list and sends user to atlas list', async () => {
        const googleMapsLoaderService = TestBed.inject(GoogleMapsAPIService)
        const store = TestBed.inject(AppStore)
        const router = TestBed.inject(Router)
        const authService = TestBed.inject(AuthService)

        const googleMapsLoaderServiceSpy = spyOn(googleMapsLoaderService, 'load')
        const storeSpy = spyOn(store, 'loadAtlasList')
        const routerSpy = spyOn(router, 'navigate')

        fixture.detectChanges();


        authService.exchangeCodeForToken()
        await fixture.whenStable()

        expect(googleMapsLoaderServiceSpy).toHaveBeenCalledTimes(1)
        expect(storeSpy).toHaveBeenCalledTimes(1)
        expect(routerSpy).toHaveBeenCalledOnceWith(['list'])

    })
})