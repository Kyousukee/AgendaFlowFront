import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Sucursal } from '../../../../core/interfaces/sucursal.interface';
import { MapPickerComponent } from '../../../../shared/components/map-picker/map-picker.component';
import { GeocodingService } from '../../../../shared/services/geocoding.service';

export interface SucursalDialogData {
  sucursal?: Sucursal;
}

export interface SucursalDialogResult {
  id?: number;
  nombre: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
  pais?: string;
  latitud?: number | null;
  longitud?: number | null;
  telefono?: string;
  activo: boolean;
}

@Component({
  selector: 'app-sucursal-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, MatDialogModule, MapPickerComponent],
  template: `
    <div class="dialog">
      <div class="dialog__header">
        <h2 class="dialog__title">{{ data.sucursal ? 'Editar' : 'Crear' }} sucursal</h2>
        <button class="dialog__close" (click)="cerrar()" aria-label="Cerrar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form class="dialog__form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label" for="nombre">Nombre *</label>
          <input
            id="nombre"
            type="text"
            class="form-input"
            placeholder="Nombre de la sucursal"
            formControlName="nombre"
            [class.form-input--error]="fieldError('nombre')"
          />
          @if (fieldError('nombre')) {
            <span class="form-error">El nombre es requerido.</span>
          }
        </div>

        <div class="form-group">
          <label class="form-label" for="direccion">Dirección</label>
          <input
            id="direccion"
            type="text"
            class="form-input"
            placeholder="Av. Principal 123"
            formControlName="direccion"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="comuna">Comuna</label>
            <input id="comuna" type="text" class="form-input" formControlName="comuna" />
          </div>
          <div class="form-group">
            <label class="form-label" for="ciudad">Ciudad</label>
            <input id="ciudad" type="text" class="form-input" formControlName="ciudad" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="region">Región</label>
            <input id="region" type="text" class="form-input" formControlName="region" />
          </div>
          <div class="form-group">
            <label class="form-label" for="telefono">Teléfono</label>
            <input id="telefono" type="tel" class="form-input" formControlName="telefono" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="pais">País</label>
          <input id="pais" type="text" class="form-input" formControlName="pais" />
        </div>

        <div class="form-group">
          <label class="form-label">Ubicación en el mapa</label>
          <app-map-picker
            [lat]="mapLat()"
            [lng]="mapLng()"
            (locationChange)="onMapLocationChange($event)"
          />
        </div>

        <div class="dialog__actions">
          <button type="button" class="btn btn--secondary" (click)="cerrar()">Cancelar</button>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || guardando()">
            {{ guardando() ? 'Guardando...' : data.sucursal ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </form>
    </div>
  `,
  // Armazón del diálogo y campos: features/admin/styles/_admin.scss (.dialog-panel).
  // Aquí solo lo propio de este diálogo (SPEC 03: se restiliza en su lugar).
  styles: ``,
})
export class SucursalDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<SucursalDialogComponent>);
  private geocodingService = inject(GeocodingService);
  data = inject<SucursalDialogData>(MAT_DIALOG_DATA);

  guardando = signal(false);
  mapLat = signal(-33.4489);
  mapLng = signal(-70.6693);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    direccion: [''],
    comuna: [''],
    ciudad: [''],
    region: [''],
    pais: ['Chile'],
    telefono: [''],
  });

  ngOnInit(): void {
    if (this.data.sucursal) {
      this.form.patchValue({
        nombre: this.data.sucursal.nombre || '',
        direccion: this.data.sucursal.direccion || '',
        comuna: this.data.sucursal.comuna || '',
        ciudad: this.data.sucursal.ciudad || '',
        region: this.data.sucursal.region || '',
        pais: this.data.sucursal.pais || 'Chile',
        telefono: this.data.sucursal.telefono || '',
      });
      if (this.data.sucursal.latitud && this.data.sucursal.longitud) {
        this.mapLat.set(this.data.sucursal.latitud);
        this.mapLng.set(this.data.sucursal.longitud);
      }
    }
  }

  onMapLocationChange(event: { lat: number; lng: number }): void {
    this.mapLat.set(event.lat);
    this.mapLng.set(event.lng);

    this.geocodingService.reverse(event.lat, event.lng).subscribe((addr) => {
      this.form.patchValue({
        direccion: addr.direccion,
        comuna: addr.comuna,
        ciudad: addr.ciudad,
        region: addr.region,
        pais: addr.pais,
      });
    });
  }

  fieldError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid || this.guardando()) return;

    this.guardando.set(true);
    const formValue = this.form.getRawValue();

    const resultado: SucursalDialogResult = {
      id: this.data.sucursal?.id,
      nombre: formValue.nombre,
      direccion: formValue.direccion || undefined,
      comuna: formValue.comuna || undefined,
      ciudad: formValue.ciudad || undefined,
      region: formValue.region || undefined,
      pais: formValue.pais || undefined,
      telefono: formValue.telefono || undefined,
      latitud: this.mapLat(),
      longitud: this.mapLng(),
      activo: this.data.sucursal?.activo ?? true,
    };

    setTimeout(() => {
      this.guardando.set(false);
      this.dialogRef.close(resultado);
    }, 300);
  }
}
