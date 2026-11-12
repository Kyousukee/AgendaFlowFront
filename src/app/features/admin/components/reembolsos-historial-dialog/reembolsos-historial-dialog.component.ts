import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Pago } from '../../../../core/interfaces/pago.interface';
import { ReembolsoHistorial } from '../../../../core/interfaces/reembolso.interface';
import { PagosService } from '../../services/pagos.service';
import { formatearPesos } from '../../utils/reembolsos.util';

/** Estados de tipo 'Pago' de un reembolso → color del estado-badge de _admin.scss. */
const CLASE_ESTADO: Record<string, string> = {
  Pendiente: 'pendiente',
  Reembolsado: 'pagado',
  Rechazado: 'rechazado',
};

/** SPEC 07: historial de reembolsos de un pago (GET /pagos/:id/reembolsos). */
@Component({
  selector: 'app-reembolsos-historial-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
  templateUrl: './reembolsos-historial-dialog.component.html',
  styleUrl: './reembolsos-historial-dialog.component.scss',
})
export class ReembolsosHistorialDialogComponent implements OnInit {
  private pagosService = inject(PagosService);
  private destroyRef = inject(DestroyRef);
  pago = inject<Pago>(MAT_DIALOG_DATA);

  reembolsos = signal<ReembolsoHistorial[]>([]);
  cargando = signal(true);
  error = signal(false);

  readonly formatearPesos = formatearPesos;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.pagosService
      .getReembolsos(this.pago.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reembolsos) => {
          this.reembolsos.set(reembolsos);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
        },
      });
  }

  claseEstado(reembolso: ReembolsoHistorial): string {
    return CLASE_ESTADO[reembolso.estado?.nombre ?? ''] ?? 'desconocido';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
