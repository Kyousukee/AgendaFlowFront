import { Component, effect, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth.service';
import { PagosService } from '../../services/pagos.service';
import { Pago } from '../../../../core/interfaces/pago.interface';
import {
  ReservaDetailDialogComponent,
} from '../../components/reserva-detail-dialog/reserva-detail-dialog.component';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.scss',
})
export class PagosComponent {
  private authService = inject(AuthService);
  private pagosService = inject(PagosService);
  private dialog = inject(MatDialog);

  pagos = signal<Pago[]>([]);
  cargando = signal(true);
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

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroEstado.set('');
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
  }
}
