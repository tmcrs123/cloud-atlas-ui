import { ComponentFixture, TestBed } from "@angular/core/testing"
import { testingModuleBaseConfig } from "../../test/config/config"
import { MarkerComponent } from "./marker.component"
import { ActivatedRoute } from "@angular/router"
import { AppStore } from "../store/store"

describe('Marker component', () => {

  let fixture: ComponentFixture<MarkerComponent>

  beforeEach(async () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { paramMap: { get: (param: string) => '42' } } } })
    TestBed.configureTestingModule({
      imports: [MarkerComponent],
      ...testingModuleBaseConfig
    }).compileComponents()

    fixture = TestBed.createComponent(MarkerComponent)
  })


  it('loads marker from store on init', () => {
    const store = TestBed.inject(AppStore);
    store.loadAtlasList()
    const loadMarkersSpy = spyOn(store, 'loadMarkers')

    fixture.detectChanges()

    expect(loadMarkersSpy).toHaveBeenCalledOnceWith({ atlasId: '42' })
  })
})