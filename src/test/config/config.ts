import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestModuleMetadata } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { routeDefinitions } from '../../app/app.routes'
import { AtlasService } from '../../app/atlas/data-access/services/atlas.service'
import { AuthService } from '../../app/auth/auth.service'
import { MockAuthService } from '../../app/auth/mock-auth.service'
import { ImagesService } from '../../app/images/data-access/images-service'
import { MarkersService } from '../../app/markers/data-access/markers.service'
import { BannerService } from '../../app/shared/services/banner-service'
import { GoogleMapsAPIService } from '../../app/shared/services/google-maps-api.service'
import { AtlasServiceMock } from '../mocks/atlas.service.mock'
import { GoogleMapsAPIServiceMock } from '../mocks/google-maps-api.service.mock'
import { ImagesServiceMock } from '../mocks/images-service.mock'
import { MarkersServiceMock } from '../mocks/markers.service.mock'

export const testingModuleBaseConfig: Omit<TestModuleMetadata, 'imports'> = {
    providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useClass: MockAuthService },
        { provide: GoogleMapsAPIService, useClass: GoogleMapsAPIServiceMock },
        { provide: AuthService, useClass: MockAuthService },
        { provide: ImagesService, useClass: ImagesServiceMock },
        { provide: AtlasService, useClass: AtlasServiceMock },
        { provide: MarkersService, useClass: MarkersServiceMock },
        { provide: BannerService, useClass: BannerService },
        provideRouter(routeDefinitions)
    ]
}
