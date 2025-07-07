import { ComponentFixture, TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { testingModuleBaseConfig } from "../../test/config/config"
import { Atlas } from "../shared/models/atlas.model"
import { BannerService } from "../shared/services/banner-service"
import { EnvironmentVariablesService } from "../shared/services/environment-variables.service"
import { AppStore } from "../store/store"
import { AtlasListComponent } from "./atlas-list.component"
import { AtlasService } from "./data-access/services/atlas.service"

let fixture: ComponentFixture<AtlasListComponent>

async function compileAndCreate() {
    TestBed.configureTestingModule({
        imports: [AtlasListComponent],
        ...testingModuleBaseConfig

    }).compileComponents()

    // this needs to be set here because this value is read onInit
    const envVariablesService = TestBed.inject(EnvironmentVariablesService)
    jest.spyOn(envVariablesService, 'getEnvironmentValue').mockReturnValue("10")
    fixture = TestBed.createComponent(AtlasListComponent)

    fixture.detectChanges();
}

describe('Atlas list', () => {

    beforeEach(async () => {
        compileAndCreate()
    })

    it('displays atlas list', () => {
        const store = TestBed.inject(AppStore)
        store.loadAtlasList()

        fixture.detectChanges();

        expect(Array.from(fixture.nativeElement.querySelectorAll('app-card')).length).toBe(1);
    })

    it('creates a new atlas if the add dialog is closed with the sufficient data', () => {
        const store = TestBed.inject(AppStore)
        const createAtlasSpy = jest.spyOn(store, 'createAtlas')
        fixture.componentInstance['addAtlasFormControl'].setValue('apples')

        fixture.componentInstance['onAddDialogClose'](true)

        expect(createAtlasSpy).toHaveBeenCalledWith({ title: 'apples' })
        expect(fixture.componentInstance['addAtlasFormControl'].value).toBe('')
    })

    it('deletes an existing atlas if the delete dialog is closed with delete action', () => {
        const store = TestBed.inject(AppStore)
        const deleteAtlasSpy = jest.spyOn(store, 'deleteAtlas')
        fixture.componentInstance['deleteAtlasFormControl'].setValue('apples')

        fixture.componentInstance['onDeleteDialogClose'](true)

        expect(deleteAtlasSpy).toHaveBeenCalledWith({ atlasId: 'apples' })
    })

    it('updates query on search term changed', async () => {
        const store = TestBed.inject(AppStore)
        const updateQuerySpy = jest.spyOn(store, 'updateQuery')

        fixture.componentInstance['searchAtlasFormControl'].setValue('pears');

        await fixture.whenStable();

        expect(updateQuerySpy).toHaveBeenCalledWith('pears')
    })

    it('shows banner if user cannot add more maps', async () => {
        const store = TestBed.inject(AppStore)
        const atlasService = TestBed.inject(AtlasService)
        const bannerService = TestBed.inject(BannerService)
        const setMessageSpy = jest.spyOn(bannerService, 'setMessage')

        const mockAtlas: Atlas[] = [];
        for (let i = 0; i < 30; i++) {
            mockAtlas.push({
                id: Math.random().toString(36).substring(2, 15),
                createdAt: '',
                markersCount: 10,
                title: Math.random().toString(36).substring(2, 15),
                claims: 'EDIT',
                markers: []
            })
        }

        jest.spyOn(atlasService, 'loadAtlasList').mockReturnValueOnce(of(mockAtlas))
        store.loadAtlasList()

        fixture.detectChanges()

        expect(setMessageSpy).toHaveBeenCalledTimes(1)
    })
})