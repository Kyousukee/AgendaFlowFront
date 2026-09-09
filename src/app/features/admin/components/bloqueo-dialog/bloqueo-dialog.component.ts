import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreateBloqueoDto } from '../../services/bloqueos.service';
import { Empleado } from '../../../../core/interfaces/empleado.interface';

export interface BloqueoDialogData {
  bloqueo?: { empleadoId: number; fecha: string; horaInicio: string; horaFin: string; motivo?: string };
  empleadoId?: number;
  empleados: Empleado[];
}

@Component({
  selector: 'app-bloqueo-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="dialog">
      <div class="dialog__header">
        <h2 class="dialog__title">{{ data.bloqueo ? 'Editar' : 'Nuevo' }} bloqueo</h2>
        <button class="dialog__close" (click)="cerrar()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form class="dialog__form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label" for="empleado">Empleado *</label>
          <select
            id="empleado"
            class="form-input"
            formControlName="empleadoId"
            [class.form-input--error]="fieldError('empleadoId')"
          >
            <option value="">Seleccionar empleado</option>
            @for (emp of data.empleados; track emp.id) {
              <option [value]="emp.id">{{ emp.nombre }} {{ emp.apellido }}</option>
            }
          </select>
          @if (fieldError('empleadoId')) {
            <span class="form-error">Selecciona un empleado.</span>
          }
        </div>

        <div class="form-group">
          <label class="form-label" for="fecha">Fecha *</label>
          <input
            id="fecha"
            type="date"
            class="form-input"
            formControlName="fecha"
            [class.form-input--error]="fieldError('fecha')"
          />
          @if (fieldError('fecha')) {
            <span class="form-error">La fecha es requerida.</span>
          }
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="horaInicio">Hora inicio *</label>
            <select
              id="horaInicio"
              class="form-input"
              formControlName="horaInicio"
              [class.form-input--error]="fieldError('horaInicio')"
            >
              <option value="">Seleccionar</option>
              @for (hora of horas; track hora) {
                <option [value]="hora">{{ hora }}</option>
              }
            </select>
            @if (fieldError('horaInicio')) {
              <span class="form-error">Requerido.</span>
            }
          </div>
          <div class="form-group">
            <label class="form-label" for="horaFin">Hora fin *</label>
            <select
              id="horaFin"
              class="form-input"
              formControlName="horaFin"
              [class.form-input--error]="fieldError('horaFin')"
            >
              <option value="">Seleccionar</option>
              @for (hora of horas; track hora) {
                <option [value]="hora">{{ hora }}</option>
              }
            </select>
            @if (fieldError('horaFin')) {
              <span class="form-error">Requerido.</span>
            }
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="motivo">Motivo</label>
          <input
            id="motivo"
            type="text"
            class="form-input"
            placeholder="Ej: Reunion personal, descanso medico..."
            formControlName="motivo"
            maxlength="300"
          />
        </div>

        <div class="dialog__actions">
          <button type="button" class="btn btn--secondary" (click)="cerrar()">Cancelar</button>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || guardando()">
            {{ guardando() ? 'Guardando...' : data.bloqueo ? 'Actualizar' : 'Crear bloqueo' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .dialog {
      padding: 0;
      min-width: 440px;
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
      appearance: none;

      &:focus {
        border-color: var(--gold);
      }
    }

    select.form-input {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      padding-right: 2rem;
      cursor: pointer;

      option {
        background: var(--bg-surface);
        color: var(--text-primary);
      }
    }

    input[type='date'].form-input {
      color-scheme: dark;
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
export class BloqueoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<BloqueoDialogComponent>);
  data = inject<BloqueoDialogData>(MAT_DIALOG_DATA);

  guardando = signal(false);
  horas = this.generarHoras();

  form = this.fb.nonNullable.group({
    empleadoId: [this.data.empleadoId || '', [Validators.required]],
    fecha: ['', [Validators.required]],
    horaInicio: ['', [Validators.required]],
    horaFin: ['', [Validators.required]],
    motivo: [''],
  });

  ngOnInit(): void {
    if (this.data.bloqueo) {
      this.form.patchValue({
        empleadoId: String(this.data.bloqueo.empleadoId),
        fecha: this.data.bloqueo.fecha,
        horaInicio: this.data.bloqueo.horaInicio,
        horaFin: this.data.bloqueo.horaFin,
        motivo: this.data.bloqueo.motivo || '',
      });
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

    const resultado: CreateBloqueoDto = {
      empleadoId: Number(formValue.empleadoId),
      fecha: formValue.fecha,
      horaInicio: formValue.horaInicio,
      horaFin: formValue.horaFin,
      motivo: formValue.motivo || undefined,
    };

    setTimeout(() => {
      this.guardando.set(false);
      this.dialogRef.close(resultado);
    }, 300);
  }

  private generarHoras(): string[] {
    const horas: string[] = [];
    for (let h = 7; h <= 22; h++) {
      horas.push(`${h.toString().padStart(2, '0')}:00`);
      horas.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return horas;
  }
}
