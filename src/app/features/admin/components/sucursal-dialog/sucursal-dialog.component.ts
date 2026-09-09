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
        <button class="dialog__close" (click)="cerrar()">
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
          <label class="form-label" for="direccion">Direccion</label>
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
            <label class="form-label" for="region">Region</label>
            <input id="region" type="text" class="form-input" formControlName="region" />
          </div>
          <div class="form-group">
            <label class="form-label" for="telefono">Telefono</label>
            <input id="telefono" type="tel" class="form-input" formControlName="telefono" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="pais">Pais</label>
          <input id="pais" type="text" class="form-input" formControlName="pais" />
        </div>

        <div class="form-group">
          <label class="form-label">Ubicacion en el mapa</label>
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
  styles: `
    .dialog {
      padding: 0;
      min-width: 480px;
    }

    .dialog__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .dialog__title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .dialog__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: none;
      background: none;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: var(--bg-surface-hover);
        color: var(--text-primary);
      }
    }

    .dialog__form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem;
    }

    .dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 0.5rem;
    }

    .form-row {
      display: flex;
      gap: 0.75rem;

      .form-group {
        flex: 1;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .form-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .form-input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.875rem;
      color: var(--text-primary);
      font-family: inherit;
      transition: border-color 0.15s ease;
      outline: none;
      box-sizing: border-box;

      &:focus {
        border-color: var(--gold);
      }
    }

    .form-input::placeholder {
      color: var(--text-muted);
    }

    .form-input--error {
      border-color: #ef4444;
    }

    .form-error {
      font-size: 0.75rem;
      color: #ef4444;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      font-family: inherit;
      transition: all 0.15s ease;
    }

    .btn--primary {
      background: var(--gold);
      color: var(--bg-primary);

      &:hover:not(:disabled) {
        background: var(--gold-light);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn--secondary {
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      border: 1px solid var(--border);

      &:hover {
        color: var(--text-primary);
        border-color: var(--border-light);
      }
    }
  `,
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
