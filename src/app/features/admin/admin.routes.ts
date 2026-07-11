import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { HorariosComponent } from './pages/horarios/horarios.component';
import { EmpleadosComponent } from './pages/empleados/empleados.component';
import { ServiciosComponent } from './pages/servicios/servicios.component';
import { PagosComponent } from './pages/pagos/pagos.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'horarios', pathMatch: 'full' },
      { path: 'horarios', component: HorariosComponent },
      { path: 'empleados', component: EmpleadosComponent },
      { path: 'servicios', component: ServiciosComponent },
      { path: 'pagos', component: PagosComponent },
    ],
  },
];
