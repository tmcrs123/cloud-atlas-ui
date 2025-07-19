import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { of, type Observable } from 'rxjs';
import { Atlas } from '../../app/shared/models/atlas.model';

@Injectable({
  providedIn: 'root',
})
export class AtlasServiceMock {
  private atlas: Atlas = {
    id: '42',
    createdAt: '',
    markersCount: 10,
    title: 'Bananas',
    claims: 'EDIT',
    markers: []
  }

  createAtlas(data: Partial<Atlas>): Observable<Atlas> {
    return of(this.atlas)
  }

  loadAtlasList(): Observable<Atlas[]> {
    return of([this.atlas])
  }


  deleteAtlas(atlasId: string): Observable<void> {
    return of()
  }

  getAtlas(atlasId: string): Observable<Atlas> {
    return of(this.atlas)
  }

  updateAtlas(atlasId: string, data: Partial<Atlas>): Observable<Atlas> {
    return of(this.atlas)
  }
}
