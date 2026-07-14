import { Component, effect, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth.service';
import { EmpleadosService } from '../../services/empleados.service';
import { Empleado } from '../../../../core/interfaces/empleado.interface';
import {
  EmpleadoDialogComponent,
  EmpleadoDialogData,
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
  private dialog = inject(MatDialog);

  empleados = signal<Empleado[]>([]);
  cargando = signal(true);
  private lastSucursalId = 0;

  constructor() {
    effect(() => {
      const suc = this.authService.sucursalActual();
      const sucursalId = suc?.id ?? 0;
      if (sucursalId && sucursalId !== this.lastSucursalId) {
        this.lastSucursalId = sucursalId;
        this.cargarEmpleados();
      }
    });
  }

  cargarEmpleados(): void {
    const sucursalId = this.authService.sucursalActual()?.id;
    if (!sucursalId) {
      this.empleados.set([]);
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.empleadosService.getBySucursal(sucursalId).subscribe({
      next: (data) => {
        this.empleados.set(data);
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
      data: { sucursalId } as EmpleadoDialogData,
      panelClass: 'dialog-panel',
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.empleadosService.crear(resultado).subscribe(() => {
          this.cargarEmpleados();
        });
      }
    });
  }

  editarEmpleado(empleado: Empleado): void {
    const sucursalId = this.authService.sucursalActual()?.id;
    if (!sucursalId) return;

    const dialogRef = this.dialog.open(EmpleadoDialogComponent, {
      data: { empleado, sucursalId } as EmpleadoDialogData,
      panelClass: 'dialog-panel',
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.empleadosService.actualizar(resultado).subscribe(() => {
          this.cargarEmpleados();
        });
      }
    });
  }

  eliminarEmpleado(empleado: Empleado): void {
    if (!empleado.id) return;
    this.empleadosService.eliminar(empleado.id).subscribe(() => {
      this.cargarEmpleados();
    });
  }

  getIniciales(nombre?: string, apellido?: string): string {
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    return (n + a).toUpperCase() || '?';
  }
}
