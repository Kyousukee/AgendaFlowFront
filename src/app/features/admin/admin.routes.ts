import { Routes } from '@angular/router';
import { soloAdminGuard } from '../../core/guards/solo-admin.guard';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { HorariosComponent } from './pages/horarios/horarios.component';
import { EmpleadosComponent } from './pages/empleados/empleados.component';
import { ServiciosComponent } from './pages/servicios/servicios.component';
import { PagosComponent } from './pages/pagos/pagos.component';
import { BloqueosComponent } from './pages/bloqueos/bloqueos.component';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';
import { ConfiguracionPagosComponent } from './pages/configuracion-pagos/configuracion-pagos.component';
import { SucursalesComponent } from './pages/sucursales/sucursales.component';
import { SuscripcionPagoComponent } from './pages/suscripcion-pago/suscripcion-pago.component';
import { EquipoComponent } from './pages/equipo/equipo.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      // SPEC 08: agenda y pagos son también del recepcionista (rol 2).
      { path: 'home', component: HomeComponent },
      { path: 'pagos', component: PagosComponent },
      {
        path: '',
        canActivateChild: [soloAdminGuard],
        children: [
          { path: 'horarios', component: HorariosComponent },
          { path: 'empleados', component: EmpleadosComponent },
          { path: 'servicios', component: ServiciosComponent },
          { path: 'bloqueos', component: BloqueosComponent },
          { path: 'sucursales', component: SucursalesComponent },
          { path: 'equipo', component: EquipoComponent },
          { path: 'configuracion', component: ConfiguracionComponent },
          { path: 'configuracion/pagos', component: ConfiguracionPagosComponent },
        ],
      },
    ],
  },
  // SPEC 06: el back redirige aquí al volver de Flow con el pago de la mensualidad.
  {
    path: 'suscripcion',
    component: LayoutComponent,
    canActivateChild: [soloAdminGuard],
    children: [{ path: 'pago', component: SuscripcionPagoComponent }],
  },
];
