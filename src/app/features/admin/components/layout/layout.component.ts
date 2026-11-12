import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../../core/services/auth.service';
import { CuentaService, mensajeErrorCuenta } from '../../../../core/services/cuenta.service';
import { SuscripcionService } from '../../../../core/services/suscripcion.service';
import { PagoSuscripcionService } from '../../../../core/services/pago-suscripcion.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  auth = inject(AuthService);
  suscripcion = inject(SuscripcionService);
  pagoSuscripcion = inject(PagoSuscripcionService);
  private cuenta = inject(CuentaService);

  // Con `undefined` (sesión guardada antes de la verificación de email) no se muestra.
  mostrarAvisoVerificacion = computed(() => this.auth.currentUser()?.emailVerificado === false);
  reenviando = signal(false);
  mensajeReenvio = signal('');

  navItems = [
    { label: 'Inicio', icon: 'dashboard', route: '/admin/home' },
    { label: 'Horarios', icon: 'schedule', route: '/admin/horarios' },
    { label: 'Empleados', icon: 'people', route: '/admin/empleados' },
    { label: 'Servicios', icon: 'content_cut', route: '/admin/servicios' },
    { label: 'Bloqueos', icon: 'event_busy', route: '/admin/bloqueos' },
    { label: 'Pagos', icon: 'payments', route: '/admin/pagos' },
  ];

  adminNavItems = [
    { label: 'Sucursales', icon: 'store', route: '/admin/sucursales' },
    { label: 'Configuración', icon: 'settings', route: '/admin/configuracion' },
  ];

  reenviarVerificacion(): void {
    if (this.reenviando()) return;
    this.reenviando.set(true);
    this.mensajeReenvio.set('');

    this.cuenta.reenviarVerificacion().subscribe({
      next: ({ emailVerificado }) => {
        this.reenviando.set(false);
        if (emailVerificado) {
          // Pudo verificarse en otro dispositivo.
          this.auth.actualizarEmailVerificado(true);
        } else {
          this.mensajeReenvio.set(
            'Si pasó al menos un minuto desde el último envío, te enviamos otro correo. Revisa también el spam.',
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        this.reenviando.set(false);
        this.mensajeReenvio.set(mensajeErrorCuenta(error));
      },
    });
  }

  cambiarSucursal(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const sucursalId = Number(select.value);
    this.auth.cambiarSucursal(sucursalId);
  }
}
