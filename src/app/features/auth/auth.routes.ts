import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { OlvideContrasenaComponent } from './pages/olvide-contrasena/olvide-contrasena.component';
import { VerificarEmailComponent } from './pages/verificar-email/verificar-email.component';
import { RestablecerContrasenaComponent } from './pages/restablecer-contrasena/restablecer-contrasena.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'olvide-contrasena',
    component: OlvideContrasenaComponent,
  },
  {
    path: 'verificar-email',
    component: VerificarEmailComponent,
  },
  {
    path: 'restablecer-contrasena',
    component: RestablecerContrasenaComponent,
  },
];
