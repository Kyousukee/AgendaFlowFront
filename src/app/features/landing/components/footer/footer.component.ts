import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  links = {
    product: [
      { label: 'Funciones', href: '#features' },
      { label: 'Precios', href: '#pricing' },
      { label: 'Integraciones', href: '#' },
      { label: 'API', href: '#' },
    ],
    company: [
      { label: 'Nosotros', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Carreras', href: '#' },
      { label: 'Contacto', href: '#' },
    ],
    support: [
      { label: 'Centro de Ayuda', href: '#' },
      { label: 'Documentacion', href: '#' },
      { label: 'Estado', href: '#' },
      { label: 'Comunidad', href: '#' },
    ],
    legal: [
      { label: 'Privacidad', href: '#' },
      { label: 'Terminos', href: '#' },
      { label: 'Seguridad', href: '#' },
    ],
  };
}
