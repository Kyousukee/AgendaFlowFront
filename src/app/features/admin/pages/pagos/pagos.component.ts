import { Component, effect, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth.service';
import { PagosService } from '../../services/pagos.service';
import { Pago } from '../../../../core/interfaces/pago.interface';
import { MetodoPagoComponent } from '../../../../shared/components/metodo-pago/metodo-pago.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReembolsoSolicitado } from '../../../../core/interfaces/reembolso.interface';
import {
  ReservaDetailDialogComponent,
} from '../../components/reserva-detail-dialog/reserva-detail-dialog.component';
import { ReembolsoDialogComponent } from '../../components/reembolso-dialog/reembolso-dialog.component';
import { ReembolsosHistorialDialogComponent } from '../../components/reembolsos-historial-dialog/reembolsos-historial-dialog.component';
import { esPagoConFlow, puedeReembolsar } from '../../utils/reembolsos.util';
import { descargarPagosExcel } from '../../utils/pagos-excel.util';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatButtonModule, MetodoPagoComponent],
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.scss',
})
export class PagosComponent {
  private authService = inject(AuthService);
  private pagosService = inject(PagosService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  /** SPEC 08: el recepcionista no reembolsa ni ve el historial de reembolsos. */
  readonly esRecepcionista = this.authService.esRecepcionista;

  pagos = signal<Pago[]>([]);
  cargando = signal(true);
  descargando = signal(false);
  busqueda = signal('');
  filtroEstado = signal('');
  filtroFechaDesde = signal('');
  filtroFechaHasta = signal('');
  private lastSucursalId = 0;

  estadosUnicos = computed(() => {
    const estados = new Set(this.pagos().map((p) => p.estado.nombre));
    return Array.from(estados).sort();
  });

  pagosFiltrados = computed(() => {
    let resultado = this.pagos();
    const texto = this.busqueda().toLowerCase().trim();
    const estado = this.filtroEstado();
    const desde = this.filtroFechaDesde();
    const hasta = this.filtroFechaHasta();

    if (texto) {
      resultado = resultado.filter(
        (p) =>
          this.getNombreCliente(p).toLowerCase().includes(texto) ||
          p.reserva.servicio.nombre?.toLowerCase().includes(texto) ||
          p.codigoTransaccion.toLowerCase().includes(texto) ||
          p.reserva.codigo.toLowerCase().includes(texto),
      );
    }

    if (estado) {
      resultado = resultado.filter((p) => p.estado.nombre === estado);
    }

    if (desde) {
      resultado = resultado.filter((p) => p.fechaPago >= desde);
    }

    if (hasta) {
      resultado = resultado.filter((p) => p.fechaPago <= hasta + 'T23:59:59');
    }

    return resultado;
  });

  constructor() {
    effect(() => {
      const suc = this.authService.sucursalActual();
      const sucursalId = suc?.id ?? 0;
      if (sucursalId && sucursalId !== this.lastSucursalId) {
        this.lastSucursalId = sucursalId;
        this.cargarPagos();
      }
    });
  }

  cargarPagos(): void {
    const sucursalId = this.authService.sucursalActual()?.id;
    if (!sucursalId) {
      this.pagos.set([]);
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.pagosService.getBySucursal(sucursalId).subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.pagos.set([]);
        this.cargando.set(false);
      },
    });
  }

  getNombreCliente(pago: Pago): string {
    const c = pago.reserva.cliente;
    return [c.nombre, c.apellido].filter(Boolean).join(' ') || 'Sin nombre';
  }

  getNombreEmpleado(pago: Pago): string {
    const e = pago.reserva.empleado;
    if (!e) return 'Sin asignar';
    return [e.nombre, e.apellido].filter(Boolean).join(' ') || 'Sin nombre';
  }

  getNombreServicio(pago: Pago): string {
    return pago.reserva.servicio.nombre || 'Sin servicio';
  }

  getNombreSucursal(pago: Pago): string {
    return pago.reserva.sucursal.nombre || 'Sin sucursal';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  }

  getEstadoClase(estado: string): string {
    const map: Record<string, string> = {
      Pagado: 'pagado',
      Pendiente: 'pendiente',
      Rechazado: 'rechazado',
      Anulado: 'anulado',
      Reembolsado: 'anulado',
    };
    return map[estado] || 'desconocido';
  }

  verReserva(pago: Pago): void {
    this.dialog.open(ReservaDetailDialogComponent, {
      data: pago,
      panelClass: 'dialog-panel',
      width: '560px',
    });
  }

  readonly puedeReembolsar = puedeReembolsar;
  readonly esPagoConFlow = esPagoConFlow;

  /** SPEC 07: abre el diálogo de reembolso; si Flow lo acepta, avisa y recarga la lista. */
  reembolsar(pago: Pago): void {
    this.dialog
      .open<ReembolsoDialogComponent, Pago, ReembolsoSolicitado>(ReembolsoDialogComponent, {
        data: pago,
        panelClass: 'dialog-panel',
        width: '480px',
      })
      .afterClosed()
      .subscribe((resultado) => {
        if (!resultado) return;
        this.snackBar.open('Reembolso solicitado', 'Cerrar', { duration: 5000 });
        this.cargarPagos();
      });
  }

  /** SPEC 07: historial de reembolsos del pago. */
  verReembolsos(pago: Pago): void {
    this.dialog.open(ReembolsosHistorialDialogComponent, {
      data: pago,
      panelClass: 'dialog-panel',
      width: '520px',
    });
  }

  /** Descarga en .xlsx exactamente lo que muestra la tabla (con búsqueda y filtros aplicados). */
  async descargarExcel(): Promise<void> {
    const pagos = this.pagosFiltrados();
    if (pagos.length === 0 || this.descargando()) return;

    this.descargando.set(true);
    try {
      await descargarPagosExcel(
        pagos,
        (pago) => ({
          cliente: this.getNombreCliente(pago),
          servicio: this.getNombreServicio(pago),
          empleado: this.getNombreEmpleado(pago),
          sucursal: this.getNombreSucursal(pago),
        }),
        this.nombreArchivoExcel(),
      );
    } catch {
      this.snackBar.open('No pudimos generar el Excel. Inténtalo de nuevo.', 'Cerrar', {
        duration: 5000,
      });
    } finally {
      this.descargando.set(false);
    }
  }

  /** pagos-<sucursal>-<desde>_<hasta>.xlsx, o con la fecha de hoy si no hay rango. */
  private nombreArchivoExcel(): string {
    const sucursal = (this.authService.sucursalActual()?.nombre ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    const desde = this.filtroFechaDesde();
    const hasta = this.filtroFechaHasta();
    const rango = desde || hasta ? `${desde || 'inicio'}_${hasta || fechaHoy}` : fechaHoy;
    return ['pagos', sucursal, rango].filter(Boolean).join('-') + '.xlsx';
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroEstado.set('');
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
  }
}
