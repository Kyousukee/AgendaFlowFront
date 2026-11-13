import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { MiembroEquipo } from '../../../../core/interfaces/equipo.interface';
import { Sucursal } from '../../../../core/interfaces/sucursal.interface';
import { EquipoService } from '../../services/equipo.service';
import { mensajeDeError } from '../../utils/reembolsos.util';

/** `invitar`: nombre, apellido, email y sucursal. `sucursal`: solo cambia la sucursal. */
export interface RecepcionistaDialogData {
  modo: 'invitar' | 'sucursal';
  sucursales: Sucursal[];
  miembro?: MiembroEquipo;
}

/**
 * SPEC 08: invita a un recepcionista (`POST /equipo`) o lo cambia de sucursal
 * (`PATCH /equipo/:id`). Cierra con el recepcionista que devuelve la API.
 */
@Component({
  selector: 'app-recepcionista-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatIconModule],
  templateUrl: './recepcionista-dialog.component.html',
})
export class RecepcionistaDialogComponent {
  private fb = inject(FormBuilder);
  private equipoService = inject(EquipoService);
  private dialogRef = inject(MatDialogRef<RecepcionistaDialogComponent, MiembroEquipo>);
  data = inject<RecepcionistaDialogData>(MAT_DIALOG_DATA);

  readonly invitar = this.data.modo === 'invitar';

  enviando = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    nombre: ['', this.invitar ? [Validators.required, Validators.maxLength(100)] : []],
    apellido: ['', [Validators.maxLength(100)]],
    email: [
      '',
      this.invitar ? [Validators.required, Validators.email, Validators.maxLength(150)] : [],
    ],
    sucursalId: this.fb.control<number | null>(
      this.data.miembro?.sucursal?.id ?? this.data.sucursales[0]?.id ?? null,
      Validators.required,
    ),
  });

  campoInvalido(campo: 'nombre' | 'email' | 'sucursalId'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  /** Cambiar a la misma sucursal no hace nada: no se cierra su sesión por nada. */
  sinCambios(): boolean {
    return !this.invitar && this.form.controls.sucursalId.value === this.data.miembro?.sucursal?.id;
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.enviando() || this.sinCambios()) return;

    const { nombre, apellido, email, sucursalId } = this.form.getRawValue();
    if (sucursalId === null) return;

    let peticion: Observable<MiembroEquipo>;
    if (this.invitar) {
      peticion = this.equipoService.invitar({
        nombre: nombre.trim(),
        ...(apellido.trim() ? { apellido: apellido.trim() } : {}),
        email: email.trim().toLowerCase(),
        sucursalId,
      });
    } else if (this.data.miembro) {
      peticion = this.equipoService.actualizar(this.data.miembro.id, { sucursalId });
    } else {
      return;
    }

    this.enviando.set(true);
    this.error.set('');
    peticion.subscribe({
      next: (miembro) => this.dialogRef.close(miembro),
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        // El límite del plan lo avisa el interceptor de suscripción, con "Ver plan".
        if (err.error?.code === 'SUSCRIPCION_LIMITE') {
          this.dialogRef.close();
          return;
        }
        if (err.status === 409) {
          this.error.set('Ese email ya tiene una cuenta');
        } else if (err.status === 400) {
          this.error.set(mensajeDeError(err) ?? 'Revisa los datos.');
        } else if (err.status === 0) {
          this.error.set('No se pudo conectar con el servidor. Revisa tu conexión.');
        } else {
          this.error.set('No pudimos guardar. Inténtalo de nuevo.');
        }
      },
    });
  }
}
