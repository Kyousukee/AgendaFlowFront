import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Empleado } from '../../../../core/interfaces/empleado.interface';
import { Servicio } from '../../../../core/interfaces/servicio.interface';

export interface EmpleadoDialogData {
  empleado?: Empleado;
  sucursalId: number;
  serviciosDisponibles?: Servicio[];
  servicioIds?: number[];
}

export type EmpleadoDialogResult = Omit<Empleado, 'id' | 'fechaCreacion' | 'foto' | 'descripcion' | 'sucursalId' | 'serviciosEmpleados'> & {
  servicioIds: number[];
  nombre: string;
  sucursalId: number;
};

@Component({
  selector: 'app-empleado-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="dialog">
      <div class="dialog__header">
        <h2 class="dialog__title" mat-dialog-title>{{ data.empleado ? 'Editar' : 'Agregar' }} empleado</h2>
        <button type="button" class="dialog__close" (click)="cerrar()" aria-label="Cerrar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form class="dialog__form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="nombre">Nombre *</label>
            <input
              id="nombre"
              type="text"
              class="form-input"
              placeholder="Nombre del empleado"
              formControlName="nombre"
              [class.form-input--error]="fieldError('nombre')"
            [attr.aria-invalid]="fieldError('nombre')"
            [attr.aria-describedby]="fieldError('nombre') ? 'nombre-error' : null"
            />
            @if (fieldError('nombre')) {
              <span class="form-error" id="nombre-error">El nombre es requerido.</span>
            }
          </div>
          <div class="form-group">
            <label class="form-label" for="apellido">Apellido</label>
            <input
              id="apellido"
              type="text"
              class="form-input"
              placeholder="Apellido del empleado"
              formControlName="apellido"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              class="form-input"
              placeholder="empleado&#64;email.com"
              formControlName="email"
              [class.form-input--error]="fieldError('email')"
            [attr.aria-invalid]="fieldError('email')"
            [attr.aria-describedby]="fieldError('email') ? 'email-error' : null"
            />
            @if (fieldError('email')) {
              <span class="form-error" id="email-error">Escribe un correo válido.</span>
            }
          </div>
          <div class="form-group">
            <label class="form-label" for="telefono">Teléfono</label>
            <input
              id="telefono"
              type="tel"
              class="form-input"
              placeholder="+56 9 1234 5678"
              formControlName="telefono"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="descripcion">Descripción / especialidad</label>
          <textarea
            id="descripcion"
            class="form-input form-textarea"
            placeholder="Ej: Barbero senior, especialista en cortes clásicos"
            formControlName="descripcion"
            rows="3"
          ></textarea>
        </div>

        @if (data.serviciosDisponibles && data.serviciosDisponibles.length > 0) {
          <div class="form-group">
            <label class="form-label">Servicios asignados</label>
            <div class="servicios-checklist">
              @for (servicio of data.serviciosDisponibles; track servicio.id) {
                <label class="servicio-check">
                  <input
                    type="checkbox"
                    class="servicio-checkbox"
                    [checked]="isServicioSeleccionado(servicio.id)"
                    (change)="toggleServicio(servicio.id)"
                  />
                  <span class="servicio-color" [style.background]="servicio.color || '#C9A84C'"></span>
                  <span class="servicio-nombre">{{ servicio.nombre }}</span>
                  <span class="servicio-duracion">{{ servicio.duracionMinutos }} min</span>
                </label>
              }
            </div>
          </div>
        }

        <div class="dialog__actions">
          <button type="button" class="btn btn--secondary" (click)="cerrar()">Cancelar</button>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || guardando()">
            {{ guardando() ? 'Guardando...' : data.empleado ? 'Guardar cambios' : 'Agregar' }}
          </button>
        </div>
      </form>
    </div>
  `,
  // Armazón del diálogo y campos: features/admin/styles/_admin.scss (.dialog-panel).
  // Aquí solo lo propio de este diálogo (SPEC 03: se restiliza en su lugar).
  styles: `
    .servicios-checklist {
      display: flex;
      flex-direction: column;
      max-height: 200px;
      overflow-y: auto;
      border-radius: 8px;
      background: var(--bg-primary);
    }

    .servicio-check {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      cursor: pointer;
      transition: background-color var(--duration-fast) var(--ease-out);

      &:hover {
        background: var(--bg-surface-hover);
      }
    }

    .servicio-checkbox {
      width: 16px;
      height: 16px;
      accent-color: var(--gold);
      cursor: pointer;
    }

    .servicio-color {
      flex-shrink: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .servicio-nombre {
      flex: 1;
      font-size: 0.9375rem;
      color: var(--text-primary);
    }

    .servicio-duracion {
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class EmpleadoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EmpleadoDialogComponent>);
  data = inject<EmpleadoDialogData>(MAT_DIALOG_DATA);

  guardando = signal(false);
  servicioIds = signal<number[]>([]);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: [''],
    email: ['', [Validators.email]],
    telefono: [''],
    descripcion: [''],
  });

  ngOnInit(): void {
    if (this.data.empleado) {
      this.form.patchValue({
        nombre: this.data.empleado.nombre || '',
        apellido: this.data.empleado.apellido || '',
        email: this.data.empleado.email || '',
        telefono: this.data.empleado.telefono || '',
        descripcion: this.data.empleado.descripcion || '',
      });
    }
    if (this.data.servicioIds) {
      this.servicioIds.set([...this.data.servicioIds]);
    }
  }

  isServicioSeleccionado(servicioId: number): boolean {
    return this.servicioIds().includes(servicioId);
  }

  toggleServicio(servicioId: number): void {
    const actual = this.servicioIds();
    if (actual.includes(servicioId)) {
      this.servicioIds.set(actual.filter((id) => id !== servicioId));
    } else {
      this.servicioIds.set([...actual, servicioId]);
    }
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

    const resultado: EmpleadoDialogResult = {
      sucursalId: this.data.sucursalId,
      nombre: formValue.nombre,
      apellido: formValue.apellido || undefined,
      email: formValue.email || undefined,
      telefono: formValue.telefono || undefined,
      activo: true,
      servicioIds: this.servicioIds(),
    };

    setTimeout(() => {
      this.guardando.set(false);
      this.dialogRef.close(resultado);
    }, 400);
  }
}
