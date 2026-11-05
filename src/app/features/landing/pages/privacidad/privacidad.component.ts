import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LegalPageComponent, SeccionLegal } from '../legal-page/legal-page.component';

interface ClaveAlmacenamiento {
  clave: string;
  tipo: 'localStorage' | 'sessionStorage';
  para: string;
  duracion: string;
}

/** Política de privacidad de AgendaFlow (incluye la sección de cookies y almacenamiento). */
@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [LegalPageComponent],
  templateUrl: './privacidad.component.html',
})
export class PrivacidadComponent {
  readonly secciones: SeccionLegal[] = [
    { id: 'responsable', titulo: 'Responsable' },
    { id: 'datos', titulo: 'Qué datos tratamos' },
    { id: 'finalidad', titulo: 'Para qué los usamos' },
    { id: 'base', titulo: 'Base de licitud' },
    { id: 'roles', titulo: 'El negocio y sus clientes' },
    { id: 'terceros', titulo: 'Con quién se comparten' },
    { id: 'cookies', titulo: 'Cookies y almacenamiento' },
    { id: 'conservacion', titulo: 'Cuánto tiempo los guardamos' },
    { id: 'derechos', titulo: 'Tus derechos' },
    { id: 'seguridad', titulo: 'Seguridad' },
    { id: 'cambios', titulo: 'Cambios a esta política' },
    { id: 'contacto', titulo: 'Contacto' },
  ];

  // Claves reales que usa la app en el navegador (core/services y features/admin/services).
  readonly almacenamiento: ClaveAlmacenamiento[] = [
    {
      clave: 'agendaflow_token',
      tipo: 'localStorage',
      para: 'Mantener abierta la sesión del panel.',
      duracion: 'Hasta cerrar sesión',
    },
    {
      clave: 'agendaflow_user, agendaflow_empresa, agendaflow_empleado',
      tipo: 'localStorage',
      para: 'Mostrar tu nombre, tu negocio y tu perfil en el panel sin pedirlos de nuevo.',
      duracion: 'Hasta cerrar sesión',
    },
    {
      clave: 'agendaflow_sucursales, agendaflow_sucursal_actual',
      tipo: 'localStorage',
      para: 'Recordar tus sucursales y cuál estás viendo.',
      duracion: 'Hasta cerrar sesión',
    },
    {
      clave: 'agendaflow_servicios_empleados',
      tipo: 'localStorage',
      para: 'Recordar qué servicios realiza cada profesional en el panel.',
      duracion: 'Hasta borrar los datos del navegador',
    },
    {
      clave: 'agendaflow_aviso_suscripcion_cerrado',
      tipo: 'sessionStorage',
      para: 'No volver a mostrar el aviso del plan si ya lo cerraste.',
      duracion: 'Hasta cerrar la pestaña',
    },
  ];

  constructor() {
    inject(Title).setTitle('Política de privacidad · AgendaFlow');
  }
}
