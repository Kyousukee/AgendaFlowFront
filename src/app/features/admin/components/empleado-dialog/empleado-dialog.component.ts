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

export interface EmpleadoDialogResult extends Empleado {
  servicioIds: number[];
}

@Component({
  selector: 'app-empleado-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="dialog">
      <div class="dialog__header">
        <h2 class="dialog__title">{{ data.empleado ? 'Editar' : 'Agregar' }} empleado</h2>
        <button class="dialog__close" (click)="cerrar()">
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
            />
            @if (fieldError('nombre')) {
              <span class="form-error">El nombre es requerido.</span>
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
            <label class="form-label" for="email">Correo electronico</label>
            <input
              id="email"
              type="email"
              class="form-input"
              placeholder="empleado&#64;email.com"
              formControlName="email"
              [class.form-input--error]="fieldError('email')"
            />
            @if (fieldError('email')) {
              <span class="form-error">Ingresa un correo valido.</span>
            }
          </div>
          <div class="form-group">
            <label class="form-label" for="telefono">Telefono</label>
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
          <label class="form-label" for="descripcion">Descripcion / Especialidad</label>
          <textarea
            id="descripcion"
            class="form-input form-textarea"
            placeholder="Ej: Barbero senior, especialista en cortes clasicos"
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
            {{ guardando() ? 'Guardando...' : data.empleado ? 'Actualizar' : 'Agregar' }}
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

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-error {
      font-size: 0.75rem;
      color: #ef4444;
    }

    .servicios-checklist {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.5rem;
      max-height: 180px;
      overflow-y: auto;
    }

    .servicio-check {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.625rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.1s ease;

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
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .servicio-nombre {
      font-size: 0.8125rem;
      color: var(--text-primary);
      flex: 1;
    }

    .servicio-duracion {
      font-size: 0.75rem;
      color: var(--text-muted);
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
      id: this.data.empleado?.id ?? 0,
      sucursalId: this.data.sucursalId,
      nombre: formValue.nombre,
      apellido: formValue.apellido || undefined,
      email: formValue.email || undefined,
      telefono: formValue.telefono || undefined,
      foto: this.data.empleado?.foto || '',
      descripcion: formValue.descripcion || undefined,
      activo: true,
      fechaCreacion: this.data.empleado?.fechaCreacion || new Date().toISOString(),
      servicioIds: this.servicioIds(),
    };

    setTimeout(() => {
      this.guardando.set(false);
      this.dialogRef.close(resultado);
    }, 400);
  }
}
