import { Component, effect, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth.service';
import { ServiciosService } from '../../services/servicios.service';
import { Servicio } from '../../../../core/interfaces/servicio.interface';
import {
  ServicioDialogComponent,
  ServicioDialogData,
} from '../../components/servicio-dialog/servicio-dialog.component';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss',
})
export class ServiciosComponent {
  private authService = inject(AuthService);
  private serviciosService = inject(ServiciosService);
  private dialog = inject(MatDialog);

  servicios = signal<Servicio[]>([]);
  cargando = signal(true);
  private lastEmpresaId = 0;

  constructor() {
    effect(() => {
      const emp = this.authService.empresa();
      const empresaId = emp?.id ?? 0;
      if (empresaId && empresaId !== this.lastEmpresaId) {
        this.lastEmpresaId = empresaId;
        this.cargarServicios();
      }
    });
  }

  cargarServicios(): void {
    const empresaId = this.authService.empresa()?.id;
    if (!empresaId) {
      this.servicios.set([]);
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.serviciosService.getByEmpresa(empresaId).subscribe({
      next: (data) => {
        this.servicios.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.servicios.set([]);
        this.cargando.set(false);
      },
    });
  }

  abrirDialogo(): void {
    const empresaId = this.authService.empresa()?.id;
    if (!empresaId) return;

    const dialogRef = this.dialog.open(ServicioDialogComponent, {
      data: { empresaId } as ServicioDialogData,
      panelClass: 'dialog-panel',
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.serviciosService.crear(resultado).subscribe(() => {
          this.cargarServicios();
        });
      }
    });
  }

  editarServicio(servicio: Servicio): void {
    const empresaId = this.authService.empresa()?.id;
    if (!empresaId) return;

    const dialogRef = this.dialog.open(ServicioDialogComponent, {
      data: { servicio, empresaId } as ServicioDialogData,
      panelClass: 'dialog-panel',
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        const { empresaId, ...body } = resultado;
        this.serviciosService.actualizar(servicio.id, body).subscribe(() => {
          this.cargarServicios();
        });
      }
    });
  }

  eliminarServicio(servicio: Servicio): void {
    if (!servicio.id) return;
    this.serviciosService.eliminar(servicio.id).subscribe(() => {
      this.cargarServicios();
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  }
}
