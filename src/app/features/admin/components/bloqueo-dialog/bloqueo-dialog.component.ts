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
        <h2 class="dialog__title" mat-dialog-title>{{ data.bloqueo ? 'Editar' : 'Nuevo' }} bloqueo</h2>
        <button type="button" class="dialog__close" (click)="cerrar()" aria-label="Cerrar">
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
            [attr.aria-invalid]="fieldError('empleadoId')"
            [attr.aria-describedby]="fieldError('empleadoId') ? 'empleadoId-error' : null"
          >
            <option value="">Seleccionar empleado</option>
            @for (emp of data.empleados; track emp.id) {
              <option [value]="emp.id">{{ emp.nombre }} {{ emp.apellido }}</option>
            }
          </select>
          @if (fieldError('empleadoId')) {
            <span class="form-error" id="empleadoId-error">Selecciona un empleado.</span>
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
            [attr.aria-invalid]="fieldError('fecha')"
            [attr.aria-describedby]="fieldError('fecha') ? 'fecha-error' : null"
          />
          @if (fieldError('fecha')) {
            <span class="form-error" id="fecha-error">La fecha es requerida.</span>
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
            [attr.aria-invalid]="fieldError('horaInicio')"
            [attr.aria-describedby]="fieldError('horaInicio') ? 'horaInicio-error' : null"
            >
              <option value="">Seleccionar</option>
              @for (hora of horas; track hora) {
                <option [value]="hora">{{ hora }}</option>
              }
            </select>
            @if (fieldError('horaInicio')) {
              <span class="form-error" id="horaInicio-error">Requerido.</span>
            }
          </div>
          <div class="form-group">
            <label class="form-label" for="horaFin">Hora fin *</label>
            <select
              id="horaFin"
              class="form-input"
              formControlName="horaFin"
              [class.form-input--error]="fieldError('horaFin')"
            [attr.aria-invalid]="fieldError('horaFin')"
            [attr.aria-describedby]="fieldError('horaFin') ? 'horaFin-error' : null"
            >
              <option value="">Seleccionar</option>
              @for (hora of horas; track hora) {
                <option [value]="hora">{{ hora }}</option>
              }
            </select>
            @if (fieldError('horaFin')) {
              <span class="form-error" id="horaFin-error">Requerido.</span>
            }
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="motivo">Motivo</label>
          <input
            id="motivo"
            type="text"
            class="form-input"
            placeholder="Ej: Reunión personal, descanso médico..."
            formControlName="motivo"
            maxlength="300"
          />
        </div>

        <div class="dialog__actions">
          <button type="button" class="btn btn--secondary" (click)="cerrar()">Cancelar</button>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || guardando()">
            {{ guardando() ? 'Guardando...' : data.bloqueo ? 'Guardar cambios' : 'Crear bloqueo' }}
          </button>
        </div>
      </form>
    </div>
  `,
  // Armazón del diálogo y campos: features/admin/styles/_admin.scss (.dialog-panel).
  // Aquí solo lo propio de este diálogo (SPEC 03: se restiliza en su lugar).
  styles: ``,
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
