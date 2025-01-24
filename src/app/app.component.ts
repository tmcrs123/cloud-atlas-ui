import { Component, inject, Injector } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapsStore } from '../maps/data-access/maps.store';
import { JsonPipe } from '@angular/common';
import { MapsService } from '../maps/data-access/services/maps.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, JsonPipe, ReactiveFormsModule],
  providers: [MapsStore],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'snappin-ui';

  injector = inject(Injector);
  mapsStore = inject(MapsStore);
  mapsService = inject(MapsService);

  constructor() {
    this.mapsStore.loadMaps(void '', { injector: this.injector });
  }

  ngOnInit() {
    console.log(this.mapsStore.mapsIterable().length);
  }
}
