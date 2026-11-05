import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { SuscripcionService } from '../../../../core/services/suscripcion.service';
import { EtiquetaPlanComponent } from '../../../../shared/components/etiqueta-plan/etiqueta-plan.component';
import { SucursalesService } from '../../services/sucursales.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Sucursal } from '../../../../core/interfaces/sucursal.interface';
import {
  SucursalDialogComponent,
  SucursalDialogData,
  SucursalDialogResult,
} from '../../components/sucursal-dialog/sucursal-dialog.component';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, EtiquetaPlanComponent],
  templateUrl: './sucursales.component.html',
  styleUrl: './sucursales.component.scss',
})
export class SucursalesComponent implements OnInit {
  private sucursalesService = inject(SucursalesService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  suscripcion = inject(SuscripcionService);

  sucursales = signal<Sucursal[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.sucursalesService.getAll().subscribe({
      next: (data) => {
        this.sucursales.set(data);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.sucursales.set([]);
        this.cargando.set(false);
        // SPEC 04: una carga fallida no se confunde con "todavía no tienes nada".
        this.avisarError(err, 'No pudimos cargar las sucursales. Recarga la página para intentarlo de nuevo.');
      },
    });
  }

  abrirDialogo(): void {
    const dialogRef = this.dialog.open(SucursalDialogComponent, {
      data: {} as SucursalDialogData,
      panelClass: 'dialog-panel',
    });

    dialogRef.afterClosed().subscribe((resultado: SucursalDialogResult | undefined) => {
      if (resultado) {
        const { id, ...payload } = resultado;
        this.sucursalesService.crear(payload).subscribe({
          next: () => {
              this.cargarDatos();
              this.suscripcion.cargar();
              this.authService.cargarSucursales();
          },
          error: (err: HttpErrorResponse) => this.avisarError(err, 'No pudimos agregar la sucursal. Revisa tu conexión e inténtalo de nuevo.'),
        });
      }
    });
  }

  editarSucursal(sucursal: Sucursal): void {
    const dialogRef = this.dialog.open(SucursalDialogComponent, {
      data: { sucursal } as SucursalDialogData,
      panelClass: 'dialog-panel',
    });

    dialogRef.afterClosed().subscribe((resultado: SucursalDialogResult | undefined) => {
      if (resultado && resultado.id) {
        const { id, ...payload } = resultado;
        this.sucursalesService.actualizar(id, payload).subscribe({
          next: () => {
              this.cargarDatos();
              this.suscripcion.cargar();
              this.authService.cargarSucursales();
          },
          error: (err: HttpErrorResponse) => this.avisarError(err, 'No pudimos guardar los cambios de la sucursal. Revisa tu conexión e inténtalo de nuevo.'),
        });
      }
    });
  }

  // SPEC 04 (TS mínimo autorizado): confirmar antes de borrar y avisar si falla.
  eliminarSucursal(sucursal: Sucursal): void {
    if (!sucursal.id) return;
    const nombre = sucursal.nombre || 'esta sucursal';
    if (!confirm(`¿Eliminar «${nombre}» con sus horarios? No se puede deshacer.`)) return;
    this.sucursalesService.eliminar(sucursal.id).subscribe({
      next: () => {
        this.cargarDatos();
        this.suscripcion.cargar();
        this.authService.cargarSucursales();
      },
      error: () => {
        this.snackBar.open(`No pudimos eliminar «${nombre}». Inténtalo de nuevo.`, 'Cerrar', {
          duration: 6000,
        });
      },
    });
  }

  // SPEC 04 (TS mínimo autorizado): un guardado fallido ya no se pierde en silencio.
  // El límite del plan lo avisa el interceptor de suscripción; aquí no se repite.
  private avisarError(err: HttpErrorResponse, mensaje: string): void {
    if (err?.error?.code === 'SUSCRIPCION_LIMITE') return;
    this.snackBar.open(mensaje, 'Cerrar', { duration: 6000 });
  }
}
