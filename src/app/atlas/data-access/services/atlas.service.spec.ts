import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AtlasService } from './atlas.service';
import { EnvironmentVariablesService } from '../../../shared/services/environment-variables.service';

describe('AtlasService', () => {
  let service: AtlasService;
  let http: HttpClient
  let env: EnvironmentVariablesService

  beforeEach(() => {
    TestBed.configureTestingModule(
      {
        providers: [provideHttpClient(), provideHttpClientTesting()]
      }

    ).compileComponents()
    service = TestBed.inject(AtlasService);
    http = TestBed.inject(HttpClient);
    env = TestBed.inject(EnvironmentVariablesService)

    jest.spyOn(env, 'getEnvironmentValue').mockReturnValue('http://localhost:3000')
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('invokes createAtlas with correct endpoint and data', () => {

    const httpSpy = jest.spyOn(http, 'post');

    service.createAtlas({ id: '1234' })

    expect(httpSpy).toHaveBeenCalledWith('http://localhost:3000/atlas', { atlasId: '1234' })
  })

  it('invokes load atlas list with correct endpoint and data', () => {

    const httpSpy = jest.spyOn(http, 'get');

    service.loadAtlasList()

    expect(httpSpy).toHaveBeenCalledWith('http://localhost:3000/atlas')
  })

  it('invokes get atlas with correct endpoint and data', () => {

    const httpSpy = jest.spyOn(http, 'get');

    service.getAtlas('12345')

    expect(httpSpy).toHaveBeenCalledWith('atlas/:atlasId', { params: { atlasId: '12345' } })
  })

  it('invokes update atlas with correct endpoint and data', () => {

    const httpSpy = jest.spyOn(http, 'put');

    service.updateAtlas('1234', {})

    expect(httpSpy).toHaveBeenCalledWith('http://localhost:3000/atlas/1234', {})
  })

  it('invokes delete atlas with correct endpoint and data', () => {

    const httpSpy = jest.spyOn(http, 'delete');

    service.deleteAtlas('1234')

    expect(httpSpy).toHaveBeenCalledWith('http://localhost:3000/atlas/1234', { body: {} })
  })
});
