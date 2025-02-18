import { ComponentFixture, TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { testingModuleBaseConfig } from "../../test/config/config"
import { Atlas } from "../shared/models/atlas.model"
import { BannerService } from "../shared/services/banner-service"
import { AppStore } from "../store/store"
import { AtlasListComponent } from "./atlas-list.component"
import { AtlasService } from "./data-access/services/atlas.service"


let fixture: ComponentFixture<AtlasListComponent>

async function compileAndCreate() {
    TestBed.configureTestingModule({
        imports: [AtlasListComponent],
        ...testingModuleBaseConfig

    }).compileComponents()

    fixture = TestBed.createComponent(AtlasListComponent)
}


describe('Atlas list', () => {
    beforeEach(async () => {
        compileAndCreate()
    })

    it('displays atlas list', () => {
        const store = TestBed.inject(AppStore)
        store.loadAtlasList()

        fixture.detectChanges()

        expect(Array.from(fixture.nativeElement.querySelectorAll('app-card')).length).toBe(1);
        expect(fixture.nativeElement.querySelector('app-card').innerText).toBe('Bananas')
    })

    it('creates a new atlas if the add dialog is closed with the sufficient data', () => {
        const store = TestBed.inject(AppStore)
        const createAtlasSpy = spyOn(store, 'createAtlas')
        fixture.componentInstance['addAtlasFormControl'].setValue('apples')

        fixture.componentInstance['onAddDialogClose'](true)

        expect(createAtlasSpy).toHaveBeenCalledOnceWith({ title: 'apples' })
        expect(fixture.componentInstance['addAtlasFormControl'].value).toBe('')
    })

    it('deletes an existing atlas if the delete dialog is closed with delete action', () => {
        const store = TestBed.inject(AppStore)
        const deleteAtlasSpy = spyOn(store, 'deleteAtlas')
        fixture.componentInstance['deleteAtlasFormControl'].setValue('apples')

        fixture.componentInstance['onDeleteDialogClose'](true)

        expect(deleteAtlasSpy).toHaveBeenCalledOnceWith({ atlasId: 'apples' })
    })

    it('updates query on search term changed', async () => {
        const store = TestBed.inject(AppStore)
        const updateQuerySpy = spyOn(store, 'updateQuery')
        fixture.detectChanges()

        fixture.componentInstance['searchAtlasFormControl'].setValue('pears')
        await fixture.whenStable();

        expect(updateQuerySpy).toHaveBeenCalledWith('pears')
    })

    it('shows banner if user cannot add more maps', () => {
        const store = TestBed.inject(AppStore)
        const atlasService = TestBed.inject(AtlasService)
        const bannerService = TestBed.inject(BannerService)
        const setMessageSpy = spyOn(bannerService, 'setMessage')

        const mockAtlas: Atlas[] = [];
        for (let i = 0; i < 30; i++) {
            mockAtlas.push({
                atlasId: Math.random().toString(36).substring(2, 15),
                createdAt: '',
                markersCount: 10,
                title: Math.random().toString(36).substring(2, 15),
                claims: 'EDIT',
                markers: []
            })
        }

        spyOn(atlasService, 'loadAtlasList').and.returnValue(of(mockAtlas))

        store.loadAtlasList()

        fixture.detectChanges()

        expect(setMessageSpy).toHaveBeenCalledTimes(1)

    })

})