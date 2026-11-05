import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SeccionLink {
  label: string;
  fragment: string;
}

interface RutaLink {
  label: string;
  route: string;
}

interface Credito {
  autor: string;
  url: string;
}

/** Footer compacto: marca, columnas Producto / Legal / Cuenta y una fila con copyright y créditos. */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  readonly producto: SeccionLink[] = [
    { label: 'Cómo se ve', fragment: 'showcase' },
    { label: 'Funciones', fragment: 'features' },
    { label: 'Rubros', fragment: 'rubros' },
    { label: 'Precios', fragment: 'pricing' },
    { label: 'Preguntas', fragment: 'faq' },
  ];

  readonly legal: RutaLink[] = [
    { label: 'Política de privacidad', route: '/privacidad' },
    { label: 'Términos y condiciones', route: '/terminos' },
  ];

  readonly cuenta: RutaLink[] = [
    { label: 'Empezar gratis', route: '/register' },
    { label: 'Iniciar sesión', route: '/login' },
  ];

  readonly creditos: Credito[] = [
    { autor: 'Agustin Fernandez', url: 'https://unsplash.com/@agustinfernandez' },
    { autor: 'Nathon Oski', url: 'https://unsplash.com/@onatecan' },
    { autor: 'Adam Winger', url: 'https://unsplash.com/@awcreativeut' },
    { autor: 'Andrea Donato', url: 'https://unsplash.com/@andreadonato' },
    { autor: 'Collin Wigger', url: 'https://unsplash.com/@swiggis' },
    { autor: 'Giorgio Trovato', url: 'https://unsplash.com/@giorgiotrovato' },
    { autor: 'Rosa Rafael', url: 'https://unsplash.com/@rosarafael' },
    { autor: 'engin akyurt', url: 'https://unsplash.com/@enginakyurt' },
  ];
}
