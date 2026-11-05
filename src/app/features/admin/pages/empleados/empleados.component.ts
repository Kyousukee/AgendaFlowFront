import { Component, effect, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { SuscripcionService } from '../../../../core/services/suscripcion.service';
import { EtiquetaPlanComponent } from '../../../../shared/components/etiqueta-plan/etiqueta-plan.component';
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
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, EtiquetaPlanComponent],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.scss',
})
export class EmpleadosComponent {
  private authService = inject(AuthService);
  private empleadosService = inject(EmpleadosService);
  private serviciosService = inject(ServiciosService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  suscripcion = inject(SuscripcionService);

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
      error: (err: HttpErrorResponse) => {
        this.empleados.set([]);
        this.cargando.set(false);
        // SPEC 04: una carga fallida no se confunde con "todavía no tienes nada".
        this.avisarError(err, 'No pudimos cargar el equipo. Recarga la página para intentarlo de nuevo.');
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
        this.empleadosService.crear({ ...empleado, servicioIds }).subscribe({
          next: () => {
              this.cargarDatos();
              this.suscripcion.cargar();
          },
          error: (err: HttpErrorResponse) => this.avisarError(err, 'No pudimos agregar al profesional. Revisa tu conexión e inténtalo de nuevo.'),
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
        this.empleadosService.actualizar(empleado.id, { ...body, servicioIds }).subscribe({
          next: () => {
              this.cargarDatos();
              this.suscripcion.cargar();
          },
          error: (err: HttpErrorResponse) => this.avisarError(err, 'No pudimos guardar los cambios del profesional. Revisa tu conexión e inténtalo de nuevo.'),
        });
      }
    });
  }

  // SPEC 04 (TS mínimo autorizado): confirmar antes de borrar y avisar si falla.
  eliminarEmpleado(empleado: Empleado): void {
    if (!empleado.id) return;
    const nombre = [empleado.nombre, empleado.apellido].filter(Boolean).join(' ');
    if (!confirm(`¿Eliminar a «${nombre}» del equipo? No se puede deshacer.`)) return;
    this.empleadosService.eliminar(empleado.id).subscribe({
      next: () => {
        this.cargarDatos();
        this.suscripcion.cargar();
      },
      error: () => {
        this.snackBar.open(`No pudimos eliminar a «${nombre}». Inténtalo de nuevo.`, 'Cerrar', {
          duration: 6000,
        });
      },
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

  // SPEC 04 (TS mínimo autorizado): un guardado fallido ya no se pierde en silencio.
  // El límite del plan lo avisa el interceptor de suscripción; aquí no se repite.
  private avisarError(err: HttpErrorResponse, mensaje: string): void {
    if (err?.error?.code === 'SUSCRIPCION_LIMITE') return;
    this.snackBar.open(mensaje, 'Cerrar', { duration: 6000 });
  }
}
