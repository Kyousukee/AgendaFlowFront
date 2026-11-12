import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Pago } from '../../../../core/interfaces/pago.interface';
import {
  ReembolsoSolicitado,
  SolicitarReembolsoDto,
} from '../../../../core/interfaces/reembolso.interface';
import { PagosService } from '../../services/pagos.service';
import { formatearPesos, mensajeDeError } from '../../utils/reembolsos.util';

/** El back ya antepone "Flow no aceptó el reembolso: " al mensaje de Flow en el 502. */
const PREFIJO_502 = /^Flow no aceptó el reembolso:\s*/i;

/**
 * SPEC 07: reembolso total o parcial de un abono Flow desde el panel. Cierra con la respuesta
 * del back si Flow aceptó; los errores (400, 502) se muestran en el mismo diálogo.
 */
@Component({
  selector: 'app-reembolso-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatIconModule],
  templateUrl: './reembolso-dialog.component.html',
  styleUrl: './reembolso-dialog.component.scss',
})
export class ReembolsoDialogComponent {
  private fb = inject(FormBuilder);
  private pagosService = inject(PagosService);
  private dialogRef = inject(MatDialogRef<ReembolsoDialogComponent, ReembolsoSolicitado>);
  pago = inject<Pago>(MAT_DIALOG_DATA);

  /**
   * Lo que queda por devolver. null si el back aún no conoce el neto (pagos anteriores a SPEC 07):
   * entonces el monto es opcional y, vacío, el back devuelve todo el reembolsable.
   */
  readonly reembolsable: number | null =
    this.pago.montoNeto == null
      ? null
      : Math.max(0, this.pago.montoNeto - (this.pago.montoReembolsado ?? 0));

  enviando = signal(false);
  error = signal('');

  form = this.fb.group({
    monto: [this.reembolsable, this.validadoresMonto()],
    cancelarReserva: this.fb.nonNullable.control(false),
  });

  readonly formatearPesos = formatearPesos;

  get montoInvalido(): boolean {
    const control = this.form.controls.monto;
    return control.invalid && (control.dirty || control.touched);
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  enviar(): void {
    if (this.enviando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { monto, cancelarReserva } = this.form.getRawValue();
    const datos: SolicitarReembolsoDto = { cancelarReserva };
    if (monto != null) datos.monto = monto;

    this.enviando.set(true);
    this.error.set('');
    this.pagosService.reembolsar(this.pago.id, datos).subscribe({
      next: (respuesta) => this.dialogRef.close(respuesta),
      error: (error: unknown) => {
        this.enviando.set(false);
        this.error.set(this.mensajeError(error));
      },
    });
  }

  private validadoresMonto(): ValidatorFn[] {
    const validadores = [Validators.min(1), Validators.pattern(/^\d+$/)];
    if (this.reembolsable === null) return validadores;
    return [...validadores, Validators.required, Validators.max(this.reembolsable)];
  }

  private mensajeError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No pudimos solicitar el reembolso. Inténtalo de nuevo.';
    }
    const mensaje = mensajeDeError(error);
    switch (error.status) {
      case 400:
        return mensaje ?? 'No pudimos solicitar este reembolso.';
      case 502: {
        const detalle = (mensaje ?? '').replace(PREFIJO_502, '').trim() || 'error desconocido';
        return `Flow no aceptó el reembolso: ${detalle}. Revisa tu saldo en Flow.`;
      }
      default:
        return (
          mensaje ?? 'No pudimos solicitar el reembolso. Revisa tu conexión e inténtalo de nuevo.'
        );
    }
  }
}
