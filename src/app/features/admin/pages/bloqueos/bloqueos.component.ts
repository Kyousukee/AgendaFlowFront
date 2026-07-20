import { Component, effect, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth.service';
import { EmpleadosService } from '../../services/empleados.service';
import { BloqueosService } from '../../services/bloqueos.service';
import { BloqueoAgenda } from '../../../../core/interfaces/bloqueo-agenda.interface';
import { Empleado } from '../../../../core/interfaces/empleado.interface';
import {
  BloqueoDialogComponent,
  BloqueoDialogData,
} from '../../components/bloqueo-dialog/bloqueo-dialog.component';

interface BloqueoBackend {
  id: number;
  empleado?: { id: number; nombre: string; apellido?: string };
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}

interface BloqueoNormalizado extends BloqueoAgenda {
  empleadoId: number;
  empleadoNombre: string;
}

@Component({
  selector: 'app-bloqueos',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './bloqueos.component.html',
  styleUrl: './bloqueos.component.scss',
})
export class BloqueosComponent {
  private authService = inject(AuthService);
  private empleadosService = inject(EmpleadosService);
  private bloqueosService = inject(BloqueosService);
  private dialog = inject(MatDialog);

  bloqueos = signal<BloqueoNormalizado[]>([]);
  empleados = signal<Empleado[]>([]);
  cargando = signal(true);
  filtroEmpleado = signal('');
  filtroFechaDesde = signal('');
  filtroFechaHasta = signal('');
  private lastSucursalId = 0;

  bloqueosFiltrados = computed(() => {
    let resultado = this.bloqueos();
    const empleadoId = this.filtroEmpleado();
    const desde = this.filtroFechaDesde();
    const hasta = this.filtroFechaHasta();

    if (empleadoId) {
      resultado = resultado.filter((b) => b.empleadoId === Number(empleadoId));
    }

    if (desde) {
      resultado = resultado.filter((b) => b.fecha >= desde);
    }

    if (hasta) {
      resultado = resultado.filter((b) => b.fecha <= hasta);
    }

    return resultado.sort((a, b) => {
      const fechaCompare = a.fecha.localeCompare(b.fecha);
      if (fechaCompare !== 0) return fechaCompare;
      return a.horaInicio.localeCompare(b.horaInicio);
    });
  });

  constructor() {
    effect(() => {
      const suc = this.authService.sucursalActual();
      const sucursalId = suc?.id ?? 0;
      if (sucursalId && sucursalId !== this.lastSucursalId) {
        this.lastSucursalId = sucursalId;
        this.cargarDatos();
      }
    });
  }

  cargarDatos(): void {
    const sucursalId = this.authService.sucursalActual()?.id;
    if (!sucursalId) {
      this.bloqueos.set([]);
      this.empleados.set([]);
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);

    this.empleadosService.getBySucursal(sucursalId).subscribe({
      next: (empleados) => this.empleados.set(empleados),
      error: () => this.empleados.set([]),
    });

    this.bloqueosService.getBySucursal().subscribe({
      next: (bloqueos) => {
        this.bloqueos.set(bloqueos.map((b) => this.normalizar(b)));
        this.cargando.set(false);
      },
      error: () => {
        this.bloqueos.set([]);
        this.cargando.set(false);
      },
    });
  }

  abrirDialogo(): void {
    const dialogRef = this.dialog.open(BloqueoDialogComponent, {
      data: {
        empleados: this.empleados(),
      } as BloqueoDialogData,
      panelClass: 'dialog-panel',
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.bloqueosService.crear(resultado).subscribe(() => {
          this.cargarDatos();
        });
      }
    });
  }

  editarBloqueo(bloqueo: BloqueoNormalizado): void {
    const dialogRef = this.dialog.open(BloqueoDialogComponent, {
      data: {
        bloqueo: {
          empleadoId: bloqueo.empleadoId,
          fecha: bloqueo.fecha,
          horaInicio: bloqueo.horaInicio.substring(0, 5),
          horaFin: bloqueo.horaFin.substring(0, 5),
          motivo: bloqueo.motivo,
        },
        empleados: this.empleados(),
      } as BloqueoDialogData,
      panelClass: 'dialog-panel',
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.bloqueosService.actualizar(bloqueo.id, resultado).subscribe(() => {
          this.cargarDatos();
        });
      }
    });
  }

  eliminarBloqueo(bloqueo: BloqueoNormalizado): void {
    this.bloqueosService.eliminar(bloqueo.id).subscribe(() => {
      this.cargarDatos();
    });
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  limpiarFiltros(): void {
    this.filtroEmpleado.set('');
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
  }

  private normalizar(b: BloqueoBackend): BloqueoNormalizado {
    return {
      id: b.id,
      empleadoId: b.empleado?.id ?? 0,
      empleadoNombre: b.empleado
        ? [b.empleado.nombre, b.empleado.apellido].filter(Boolean).join(' ')
        : '',
      fecha: b.fecha,
      horaInicio: b.horaInicio.substring(0, 5),
      horaFin: b.horaFin.substring(0, 5),
      motivo: b.motivo,
    };
  }
}
