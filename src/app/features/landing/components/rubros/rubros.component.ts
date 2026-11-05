import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

type Tono = 'gold' | 'char' | 'bone' | 'ink';

interface TilePalabra {
  tipo: 'palabra';
  palabra: string;
  detalle: string;
  tono: Tono;
  larga?: boolean;
}

interface TileFoto {
  tipo: 'foto';
  src: string;
  alt: string;
  ancho: number;
  alto: number;
}

type Tile = TilePalabra | TileFoto;

/** Rubros — muro de palabras con una foto cada tres o cuatro celdas. */
@Component({
  selector: 'app-rubros',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './rubros.component.html',
  styleUrl: './rubros.component.scss',
})
export class RubrosComponent {
  readonly tiles: Tile[] = [
    { tipo: 'palabra', palabra: 'Barbería', detalle: 'Corte, barba y perfilado', tono: 'gold' },
    { tipo: 'palabra', palabra: 'Peluquería', detalle: 'Corte, color y brushing', tono: 'char' },
    {
      tipo: 'foto',
      src: 'images/landing/tatuaje.webp',
      alt: 'Tatuador trabajando en el brazo de un cliente',
      ancho: 1100,
      alto: 1650,
    },
    { tipo: 'palabra', palabra: 'Tatuaje', detalle: 'Sesiones largas y abonos', tono: 'bone' },
    { tipo: 'palabra', palabra: 'Uñas', detalle: 'Manicure y esmaltado', tono: 'ink' },
    {
      tipo: 'foto',
      src: 'images/landing/unas.webp',
      alt: 'Manicurista aplicando esmalte en una uña',
      ancho: 1600,
      alto: 1067,
    },
    {
      tipo: 'palabra',
      palabra: 'Cosmetología',
      detalle: 'Limpiezas y tratamientos',
      tono: 'gold',
      larga: true,
    },
    { tipo: 'palabra', palabra: 'Spa', detalle: 'Masajes y circuitos', tono: 'char' },
    {
      tipo: 'foto',
      src: 'images/landing/cosmetologia.webp',
      alt: 'Cosmetóloga aplicando una mascarilla facial',
      ancho: 1600,
      alto: 1067,
    },
    { tipo: 'palabra', palabra: 'Masajes', detalle: 'Por sesión o por plan', tono: 'bone' },
    { tipo: 'palabra', palabra: 'Pestañas', detalle: 'Cejas, lifting y extensiones', tono: 'ink' },
    {
      tipo: 'foto',
      src: 'images/landing/spa.webp',
      alt: 'Masaje con piedras calientes en un spa',
      ancho: 1600,
      alto: 1067,
    },
  ];
}
