import { Component, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MapPickerComponent } from '../../../../shared/components/map-picker/map-picker.component';
import { GeocodingService } from '../../../../shared/services/geocoding.service';
import { FormSucursal } from '../../forms/datos-negocio.form';

/** Campos del paso "Sucursal", con el mapa que completa la dirección. */
@Component({
  selector: 'app-sucursal-fields',
  standalone: true,
  imports: [ReactiveFormsModule, MapPickerComponent],
  templateUrl: './sucursal-fields.component.html',
  styleUrl: './sucursal-fields.component.scss',
})
export class SucursalFieldsComponent {
  private geocodingService = inject(GeocodingService);

  form = input.required<FormSucursal>();

  mapLat = signal(-33.4489);
  mapLng = signal(-70.6693);

  onMapLocationChange(event: { lat: number; lng: number }): void {
    this.mapLat.set(event.lat);
    this.mapLng.set(event.lng);
    this.form().patchValue({
      latitud: event.lat,
      longitud: event.lng,
    });

    this.geocodingService.reverse(event.lat, event.lng).subscribe((addr) => {
      this.form().patchValue({
        direccion: addr.direccion,
        comuna: addr.comuna,
        ciudad: addr.ciudad,
        region: addr.region,
        pais: addr.pais,
      });
    });
  }
}
