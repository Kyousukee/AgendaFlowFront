import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
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
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './sucursales.component.html',
  styleUrl: './sucursales.component.scss',
})
export class SucursalesComponent implements OnInit {
  private sucursalesService = inject(SucursalesService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

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
      error: () => {
        this.sucursales.set([]);
        this.cargando.set(false);
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
        this.sucursalesService.crear(payload).subscribe(() => {
          this.cargarDatos();
          this.authService.cargarSucursales();
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
        this.sucursalesService.actualizar(id, payload).subscribe(() => {
          this.cargarDatos();
          this.authService.cargarSucursales();
        });
      }
    });
  }

  eliminarSucursal(sucursal: Sucursal): void {
    if (!sucursal.id) return;
    this.sucursalesService.eliminar(sucursal.id).subscribe(() => {
      this.cargarDatos();
      this.authService.cargarSucursales();
    });
  }
}
