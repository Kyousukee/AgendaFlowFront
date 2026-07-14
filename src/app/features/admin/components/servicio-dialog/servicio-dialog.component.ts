import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Servicio } from '../../../../core/interfaces/servicio.interface';

export interface ServicioDialogData {
  servicio?: Servicio;
  empresaId: number;
}

const COLORES_PREDEFINIDOS = [
  '#C9A84C',
  '#60A5FA',
  '#F472B6',
  '#34D399',
  '#A78BFA',
  '#F97316',
  '#EF4444',
  '#14B8A6',
  '#8B5CF6',
  '#EC4899',
];

@Component({
  selector: 'app-servicio-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="dialog">
      <div class="dialog__header">
        <h2 class="dialog__title">{{ data.servicio ? 'Editar' : 'Agregar' }} servicio</h2>
        <button class="dialog__close" (click)="cerrar()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form class="dialog__form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label" for="nombre">Nombre del servicio *</label>
          <input
            id="nombre"
            type="text"
            class="form-input"
            placeholder="Ej: Corte de pelo"
            formControlName="nombre"
            [class.form-input--error]="fieldError('nombre')"
          />
          @if (fieldError('nombre')) {
            <span class="form-error">El nombre es requerido.</span>
          }
        </div>

        <div class="form-group">
          <label class="form-label" for="descripcion">Descripcion</label>
          <textarea
            id="descripcion"
            class="form-input form-textarea"
            placeholder="Describe el servicio..."
            formControlName="descripcion"
            rows="2"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="duracion">Duracion (minutos) *</label>
            <input
              id="duracion"
              type="number"
              class="form-input"
              placeholder="30"
              formControlName="duracionMinutos"
              min="5"
              step="5"
              [class.form-input--error]="fieldError('duracionMinutos')"
            />
            @if (fieldError('duracionMinutos')) {
              <span class="form-error">Requerido, minimo 5 min.</span>
            }
          </div>
          <div class="form-group">
            <label class="form-label" for="precio">Precio (CLP) *</label>
            <input
              id="precio"
              type="number"
              class="form-input"
              placeholder="15000"
              formControlName="precio"
              min="0"
              step="500"
              [class.form-input--error]="fieldError('precio')"
            />
            @if (fieldError('precio')) {
              <span class="form-error">Requerido.</span>
            }
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Color</label>
          <div class="color-picker">
            @for (color of colores; track color) {
              <button
                type="button"
                class="color-swatch"
                [style.background]="color"
                [class.color-swatch--selected]="form.get('color')?.value === color"
                (click)="form.get('color')?.setValue(color)"
              ></button>
            }
          </div>
        </div>

        <div class="dialog__actions">
          <button type="button" class="btn btn--secondary" (click)="cerrar()">Cancelar</button>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || guardando()">
            {{ guardando() ? 'Guardando...' : data.servicio ? 'Actualizar' : 'Agregar' }}
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
      min-height: 60px;
    }

    .form-error {
      font-size: 0.75rem;
      color: #ef4444;
    }

    .color-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .color-swatch {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
      padding: 0;

      &:hover {
        transform: scale(1.15);
      }
    }

    .color-swatch--selected {
      border-color: var(--text-primary);
      box-shadow:
        0 0 0 2px var(--bg-primary),
        0 0 0 4px currentColor;
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
export class ServicioDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ServicioDialogComponent>);
  data = inject<ServicioDialogData>(MAT_DIALOG_DATA);

  guardando = signal(false);
  colores = COLORES_PREDEFINIDOS;

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    descripcion: [''],
    duracionMinutos: [30, [Validators.required, Validators.min(5)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    color: ['#C9A84C'],
  });

  ngOnInit(): void {
    if (this.data.servicio) {
      this.form.patchValue({
        nombre: this.data.servicio.nombre || '',
        descripcion: this.data.servicio.descripcion || '',
        duracionMinutos: this.data.servicio.duracionMinutos,
        precio: this.data.servicio.precio,
        color: this.data.servicio.color || '#C9A84C',
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

    const resultado: Servicio = {
      id: this.data.servicio?.id ?? 0,
      empresaId: this.data.empresaId,
      nombre: formValue.nombre,
      descripcion: formValue.descripcion || undefined,
      duracionMinutos: formValue.duracionMinutos,
      precio: formValue.precio,
      color: formValue.color || undefined,
      activo: true,
      fechaCreacion: this.data.servicio?.fechaCreacion || new Date().toISOString(),
    };

    setTimeout(() => {
      this.guardando.set(false);
      this.dialogRef.close(resultado);
    }, 400);
  }
}
