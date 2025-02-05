import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { AtlasListComponent } from './atlas-list.component';

describe('MapsComponent', () => {
  let component: AtlasListComponent;
  let fixture: ComponentFixture<AtlasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtlasListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AtlasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
