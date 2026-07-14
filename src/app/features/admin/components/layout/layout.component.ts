import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../../core/services/auth.service';

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

  navItems = [
    { label: 'Inicio', icon: 'dashboard', route: '/admin/home' },
    { label: 'Horarios', icon: 'schedule', route: '/admin/horarios' },
    { label: 'Empleados', icon: 'people', route: '/admin/empleados' },
    { label: 'Servicios', icon: 'content_cut', route: '/admin/servicios' },
    { label: 'Pagos', icon: 'payments', route: '/admin/pagos' },
  ];

  cambiarSucursal(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const sucursalId = Number(select.value);
    this.auth.cambiarSucursal(sucursalId);
  }
}
