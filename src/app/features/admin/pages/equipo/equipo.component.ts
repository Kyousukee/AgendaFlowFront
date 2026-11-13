import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { SuscripcionService } from '../../../../core/services/suscripcion.service';
import { MiembroEquipo } from '../../../../core/interfaces/equipo.interface';
import { EtiquetaPlanComponent } from '../../../../shared/components/etiqueta-plan/etiqueta-plan.component';
import { EquipoService } from '../../services/equipo.service';
import {
  RecepcionistaDialogComponent,
  RecepcionistaDialogData,
} from '../../components/recepcionista-dialog/recepcionista-dialog.component';

type EstadoMiembro = 'pendiente' | 'activo' | 'desactivado' | 'plan';

const ETIQUETAS: Record<EstadoMiembro, string> = {
  pendiente: 'Invitación pendiente',
  activo: 'Activo',
  desactivado: 'Desactivado',
  plan: 'Desactivado por plan',
};

/** SPEC 08: recepcionistas de la empresa. Solo el dueño (rol 1). */
@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule, EtiquetaPlanComponent],
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.scss',
})
export class EquipoComponent implements OnInit {
  private equipoService = inject(EquipoService);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  suscripcion = inject(SuscripcionService);

  miembros = signal<MiembroEquipo[]>([]);
  cargando = signal(true);
  /** Id del recepcionista con una acción en curso, para no repetirla. */
  ocupado = signal<number | null>(null);

  /** Un recepcionista solo se asigna a una sucursal activa. */
  sucursales = computed(() => this.auth.sucursales().filter((s) => s.activo !== false));

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.equipoService.listar().subscribe({
      next: (miembros) => {
        this.miembros.set(miembros);
        this.cargando.set(false);
      },
      error: () => {
        this.miembros.set([]);
        this.cargando.set(false);
        this.avisar('No pudimos cargar el equipo. Recarga la página para intentarlo de nuevo.');
      },
    });
  }

  estado(m: MiembroEquipo): EstadoMiembro {
    if (!m.activo) return m.desactivadoPorSuscripcion ? 'plan' : 'desactivado';
    return m.invitacionPendiente ? 'pendiente' : 'activo';
  }

  etiqueta(m: MiembroEquipo): string {
    return ETIQUETAS[this.estado(m)];
  }

  nombre(m: MiembroEquipo): string {
    return [m.nombre, m.apellido].filter(Boolean).join(' ');
  }

  invitar(): void {
    this.dialog
      .open<RecepcionistaDialogComponent, RecepcionistaDialogData, MiembroEquipo>(
        RecepcionistaDialogComponent,
        {
          data: { modo: 'invitar', sucursales: this.sucursales() },
          panelClass: 'dialog-panel',
          width: '520px',
        },
      )
      .afterClosed()
      .subscribe((miembro) => {
        if (!miembro) return;
        this.avisar(`Invitación enviada a ${miembro.email}`);
        this.cargar();
        this.suscripcion.cargar();
      });
  }

  cambiarSucursal(m: MiembroEquipo): void {
    this.dialog
      .open<RecepcionistaDialogComponent, RecepcionistaDialogData, MiembroEquipo>(
        RecepcionistaDialogComponent,
        {
          data: { modo: 'sucursal', sucursales: this.sucursales(), miembro: m },
          panelClass: 'dialog-panel',
          width: '480px',
        },
      )
      .afterClosed()
      .subscribe((actualizado) => {
        if (!actualizado) return;
        this.reemplazar(actualizado);
        this.avisar(
          `${this.nombre(actualizado)} ahora atiende en ${actualizado.sucursal?.nombre ?? 'otra sucursal'}`,
        );
      });
  }

  cambiarActivo(m: MiembroEquipo): void {
    if (this.ocupado() !== null) return;
    const activar = !m.activo;
    if (!activar && !confirm(`¿Desactivar a ${this.nombre(m)}? Se cerrará su sesión.`)) return;

    this.ocupado.set(m.id);
    this.equipoService.actualizar(m.id, { activo: activar }).subscribe({
      next: (actualizado) => {
        this.ocupado.set(null);
        this.reemplazar(actualizado);
        this.suscripcion.cargar();
        this.avisar(activar ? `Activaste a ${this.nombre(m)}` : `Desactivaste a ${this.nombre(m)}`);
      },
      error: (err: HttpErrorResponse) => {
        this.ocupado.set(null);
        // El límite del plan lo avisa el interceptor de suscripción.
        if (err.error?.code === 'SUSCRIPCION_LIMITE') return;
        this.avisar('No pudimos guardar el cambio. Inténtalo de nuevo.');
      },
    });
  }

  reenviar(m: MiembroEquipo): void {
    if (this.ocupado() !== null) return;
    this.ocupado.set(m.id);
    this.equipoService.reenviarInvitacion(m.id).subscribe({
      next: () => {
        this.ocupado.set(null);
        this.avisar(`Invitación reenviada a ${m.email}`);
      },
      error: (err: HttpErrorResponse) => {
        this.ocupado.set(null);
        if (err.status === 429) {
          this.avisar('Espera un momento antes de reenviar');
        } else if (err.status === 409) {
          // Ya la aceptó o está desactivado: la lista estaba desactualizada.
          this.avisar('Esta invitación ya no está pendiente');
          this.cargar();
        } else {
          this.avisar('No pudimos reenviar la invitación. Inténtalo de nuevo.');
        }
      },
    });
  }

  private reemplazar(actualizado: MiembroEquipo): void {
    this.miembros.update((lista) => lista.map((m) => (m.id === actualizado.id ? actualizado : m)));
  }

  private avisar(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
  }
}
