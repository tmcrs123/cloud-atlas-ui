import { TestBed } from "@angular/core/testing"
import { testingModuleBaseConfig } from "../../test/config/config"
import { AppStore } from "./store";

describe('appStore', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            ...testingModuleBaseConfig
        }).compileComponents()
    })

    it('stores things', () => {
        const store = TestBed.inject(AppStore)
        expect(store.atlasList()).toEqual({})
    })

    it('returns correct maps count', () => {
        const store = TestBed.inject(AppStore)
        store.createAtlas({ atlasId: '123', owner: 'someone' })

        expect(store.mapsCount()).toBe(1)
    })

    it('createAtlas', () => {
        const store = TestBed.inject(AppStore)
        store.createAtlas({ atlasId: '123', owner: 'someone' })

        expect(Object.keys(store.atlasList()).length).toBe(1)
    })

})