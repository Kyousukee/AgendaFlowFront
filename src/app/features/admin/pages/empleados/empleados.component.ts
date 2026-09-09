import { Component, effect, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth.service';
import { EmpleadosService } from '../../services/empleados.service';
import { ServiciosService } from '../../services/servicios.service';
import { Empleado } from '../../../../core/interfaces/empleado.interface';
import { Servicio } from '../../../../core/interfaces/servicio.interface';
import {
  EmpleadoDialogComponent,
  EmpleadoDialogData,
  EmpleadoDialogResult,
} from '../../components/empleado-dialog/empleado-dialog.component';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.scss',
})
export class EmpleadosComponent {
  private authService = inject(AuthService);
  private empleadosService = inject(EmpleadosService);
  private serviciosService = inject(ServiciosService);
  private dialog = inject(MatDialog);

  empleados = signal<Empleado[]>([]);
  servicios = signal<Servicio[]>([]);
  servicioIdsMap = signal<Record<number, number[]>>({});
  cargando = signal(true);
  private lastSucursalId = 0;

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
    const empresaId = this.authService.empresa()?.id;
    const sucursalId = this.authService.sucursalActual()?.id;
    if (!sucursalId) {
      this.empleados.set([]);
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);

    this.serviciosService.getByEmpresa(empresaId!).subscribe({
      next: (data) => this.servicios.set(data),
      error: () => this.servicios.set([]),
    });

    this.empleadosService.getBySucursal(sucursalId).subscribe({
      next: (empleados) => {
        console.log('Empleados cargados:', empleados);
        this.empleados.set(empleados);
        const map: Record<number, number[]> = {};
        for (const e of empleados) {
          map[e.id] = (e.serviciosEmpleados || []).map((se) => se.servicio.id);
        }
        this.servicioIdsMap.set(map);
        this.cargando.set(false);
      },
      error: () => {
        this.empleados.set([]);
        this.cargando.set(false);
      },
    });
  }

  abrirDialogo(): void {
    const sucursalId = this.authService.sucursalActual()?.id;
    if (!sucursalId) return;

    const dialogRef = this.dialog.open(EmpleadoDialogComponent, {
      data: {
        sucursalId,
        serviciosDisponibles: this.servicios(),
        servicioIds: [],
      } as EmpleadoDialogData,
      panelClass: 'dialog-panel',
    });

    dialogRef.afterClosed().subscribe((resultado: EmpleadoDialogResult | undefined) => {
      if (resultado) {
        const { servicioIds, ...empleado } = resultado;
        this.empleadosService.crear({ ...empleado, servicioIds }).subscribe(() => {
          this.cargarDatos();
        });
      }
    });
  }

  editarEmpleado(empleado: Empleado): void {
    const sucursalId = this.authService.sucursalActual()?.id;
    if (!sucursalId) return;

    const dialogRef = this.dialog.open(EmpleadoDialogComponent, {
      data: {
        empleado,
        sucursalId,
        serviciosDisponibles: this.servicios(),
        servicioIds: this.servicioIdsMap()[empleado.id] || [],
      } as EmpleadoDialogData,
      panelClass: 'dialog-panel',
    });

    dialogRef.afterClosed().subscribe((resultado: EmpleadoDialogResult | undefined) => {
      if (resultado) {
        const { servicioIds, sucursalId: _, ...body } = resultado;
        this.empleadosService.actualizar(empleado.id, { ...body, servicioIds }).subscribe(() => {
          this.cargarDatos();
        });
      }
    });
  }

  eliminarEmpleado(empleado: Empleado): void {
    if (!empleado.id) return;
    this.empleadosService.eliminar(empleado.id).subscribe(() => {
      this.cargarDatos();
    });
  }

  getIniciales(nombre?: string, apellido?: string): string {
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    return (n + a).toUpperCase() || '?';
  }

  getServiciosAsignados(empleadoId: number): string {
    const ids = this.servicioIdsMap()[empleadoId] || [];
    const nombres = this.servicios()
      .filter((s) => ids.includes(s.id))
      .map((s) => s.nombre);
    return nombres.join(', ') || 'Sin servicios';
  }
}
