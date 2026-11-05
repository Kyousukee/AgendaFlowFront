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
import { ServiciosService } from '../../services/servicios.service';
import { Servicio } from '../../../../core/interfaces/servicio.interface';
import {
  ServicioDialogComponent,
  ServicioDialogData,
} from '../../components/servicio-dialog/servicio-dialog.component';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, EtiquetaPlanComponent],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss',
})
export class ServiciosComponent {
  private authService = inject(AuthService);
  private serviciosService = inject(ServiciosService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  suscripcion = inject(SuscripcionService);

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
      error: (err: HttpErrorResponse) => {
        this.servicios.set([]);
        this.cargando.set(false);
        // SPEC 04: una carga fallida no se confunde con "todavía no tienes nada".
        this.avisarError(err, 'No pudimos cargar los servicios. Recarga la página para intentarlo de nuevo.');
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
        this.serviciosService.crear(resultado).subscribe({
          next: () => {
              this.cargarServicios();
              this.suscripcion.cargar();
          },
          error: (err: HttpErrorResponse) => this.avisarError(err, 'No pudimos agregar el servicio. Revisa tu conexión e inténtalo de nuevo.'),
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
        this.serviciosService.actualizar(servicio.id, body).subscribe({
          next: () => {
              this.cargarServicios();
              this.suscripcion.cargar();
          },
          error: (err: HttpErrorResponse) => this.avisarError(err, 'No pudimos guardar los cambios del servicio. Revisa tu conexión e inténtalo de nuevo.'),
        });
      }
    });
  }

  // SPEC 04 (TS mínimo autorizado): confirmar antes de borrar y avisar si falla.
  eliminarServicio(servicio: Servicio): void {
    if (!servicio.id) return;
    if (!confirm(`¿Eliminar el servicio «${servicio.nombre}»? No se puede deshacer.`)) return;
    this.serviciosService.eliminar(servicio.id).subscribe({
      next: () => {
        this.cargarServicios();
        this.suscripcion.cargar();
      },
      error: () => {
        this.snackBar.open(`No pudimos eliminar «${servicio.nombre}». Inténtalo de nuevo.`, 'Cerrar', {
          duration: 6000,
        });
      },
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  }

  // SPEC 04 (TS mínimo autorizado): un guardado fallido ya no se pierde en silencio.
  // El límite del plan lo avisa el interceptor de suscripción; aquí no se repite.
  private avisarError(err: HttpErrorResponse, mensaje: string): void {
    if (err?.error?.code === 'SUSCRIPCION_LIMITE') return;
    this.snackBar.open(mensaje, 'Cerrar', { duration: 6000 });
  }
}
