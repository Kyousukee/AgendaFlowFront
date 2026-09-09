import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Pago } from '../../../../core/interfaces/pago.interface';

@Component({
  selector: 'app-reserva-detail-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
  templateUrl: './reserva-detail-dialog.component.html',
  styleUrl: './reserva-detail-dialog.component.scss',
})
export class ReservaDetailDialogComponent {
  data = inject<Pago>(MAT_DIALOG_DATA);

  getNombreCliente(): string {
    const c = this.data.reserva.cliente;
    return [c.nombre, c.apellido].filter(Boolean).join(' ') || 'Sin nombre';
  }

  getNombreEmpleado(): string {
    const e = this.data.reserva.empleado;
    if (!e) return 'Sin asignar';
    return [e.nombre, e.apellido].filter(Boolean).join(' ') || 'Sin nombre';
  }

  getNombreSucursal(): string {
    const s = this.data.reserva.sucursal;
    const partes = [s.nombre, s.comuna, s.ciudad].filter(Boolean);
    return partes.join(', ') || 'Sin ubicacion';
  }

  getNombreServicio(): string {
    return this.data.reserva.servicio.nombre || 'Sin servicio';
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatearHora(hora: string): string {
    const [h, m] = hora.split(':');
    return `${h}:${m}`;
  }
}
