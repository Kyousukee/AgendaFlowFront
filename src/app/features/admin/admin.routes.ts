import { Routes } from '@angular/router';
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

export const routes: Routes = [
  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'horarios', component: HorariosComponent },
      { path: 'empleados', component: EmpleadosComponent },
      { path: 'servicios', component: ServiciosComponent },
      { path: 'pagos', component: PagosComponent },
      { path: 'bloqueos', component: BloqueosComponent },
      { path: 'sucursales', component: SucursalesComponent },
      { path: 'configuracion', component: ConfiguracionComponent },
      { path: 'configuracion/pagos', component: ConfiguracionPagosComponent },
    ],
  },
  // SPEC 06: el back redirige aquí al volver de Flow con el pago de la mensualidad.
  {
    path: 'suscripcion',
    component: LayoutComponent,
    children: [{ path: 'pago', component: SuscripcionPagoComponent }],
  },
];
