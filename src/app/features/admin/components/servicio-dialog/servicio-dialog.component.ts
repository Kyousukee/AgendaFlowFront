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
  '#A78BFA', // taste-skill-ignore: color elegible por el dueño para un servicio
  '#F97316',
  '#EF4444',
  '#14B8A6',
  '#8B5CF6', // taste-skill-ignore: color elegible por el dueño para un servicio
  '#EC4899',
];

@Component({
  selector: 'app-servicio-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="dialog">
      <div class="dialog__header">
        <h2 class="dialog__title" mat-dialog-title>{{ data.servicio ? 'Editar' : 'Agregar' }} servicio</h2>
        <button type="button" class="dialog__close" (click)="cerrar()" aria-label="Cerrar">
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
            [attr.aria-invalid]="fieldError('nombre')"
            [attr.aria-describedby]="fieldError('nombre') ? 'nombre-error' : null"
          />
          @if (fieldError('nombre')) {
            <span class="form-error" id="nombre-error">El nombre es requerido.</span>
          }
        </div>

        <div class="form-group">
          <label class="form-label" for="descripcion">Descripción</label>
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
            <label class="form-label" for="duracion">Duración (minutos) *</label>
            <input
              id="duracion"
              type="number"
              class="form-input"
              placeholder="30"
              formControlName="duracionMinutos"
              min="5"
              step="5"
              [class.form-input--error]="fieldError('duracionMinutos')"
            [attr.aria-invalid]="fieldError('duracionMinutos')"
            [attr.aria-describedby]="fieldError('duracionMinutos') ? 'duracionMinutos-error' : null"
            />
            @if (fieldError('duracionMinutos')) {
              <span class="form-error" id="duracionMinutos-error">Requerido, mínimo 5 min.</span>
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
            [attr.aria-invalid]="fieldError('precio')"
            [attr.aria-describedby]="fieldError('precio') ? 'precio-error' : null"
            />
            @if (fieldError('precio')) {
              <span class="form-error" id="precio-error">Requerido.</span>
            }
          </div>
        </div>

        <div class="form-group">
          <span class="form-label" id="color-label">Color en la agenda</span>
          <div class="color-picker" role="group" aria-labelledby="color-label">
            @for (color of colores; track color; let i = $index) {
              <button
                type="button"
                class="color-swatch"
                [style.background]="color"
                [class.color-swatch--selected]="form.get('color')?.value === color"
                [attr.aria-pressed]="form.get('color')?.value === color"
                [attr.aria-label]="'Color ' + (i + 1) + ' de ' + colores.length"
                (click)="form.get('color')?.setValue(color)"
              ></button>
            }
          </div>
        </div>

        <div class="dialog__actions">
          <button type="button" class="btn btn--secondary" (click)="cerrar()">Cancelar</button>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || guardando()">
            {{ guardando() ? 'Guardando...' : data.servicio ? 'Guardar cambios' : 'Agregar' }}
          </button>
        </div>
      </form>
    </div>
  `,
  // Armazón del diálogo y campos: features/admin/styles/_admin.scss (.dialog-panel).
  // Aquí solo lo propio de este diálogo (SPEC 03: se restiliza en su lugar).
  styles: `
    .color-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .color-swatch {
      width: 32px;
      height: 32px;
      padding: 0;
      border: 2px solid transparent;
      border-radius: 50%;
      cursor: pointer;
      transition: transform var(--duration-fast) var(--ease-out);

      &:hover {
        transform: scale(1.1);
      }

      &:focus-visible {
        outline: 2px solid var(--gold-light);
        outline-offset: 2px;
      }
    }

    .color-swatch--selected {
      outline: 2px solid var(--text-primary);
      outline-offset: 2px;
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

    const resultado: Omit<Servicio, 'id' | 'fechaCreacion'> = {
      empresaId: this.data.empresaId,
      nombre: formValue.nombre,
      descripcion: formValue.descripcion || undefined,
      duracionMinutos: formValue.duracionMinutos,
      precio: formValue.precio,
      color: formValue.color || undefined,
      activo: true,
    };

    setTimeout(() => {
      this.guardando.set(false);
      this.dialogRef.close(resultado);
    }, 400);
  }
}
