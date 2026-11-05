// Datos de ejemplo del showcase. Son de muestra (negocio, clientes y horarios ficticios)
// y cuadran entre sí: las mismas reservas aparecen en la agenda y en los pagos.

export type Salida = 'reservas' | 'confirmacion' | 'agenda' | 'pago';

export interface SalidaOpcion {
  id: Salida;
  label: string;
}

export interface ServicioDemo {
  id: string;
  nombre: string;
  duracion: number; // minutos
  precio: number; // CLP
}

export interface ReservaDemo {
  inicio: number; // minutos desde 00:00
  fin: number;
  titulo: string;
  cliente: string | null; // null = bloqueo de agenda
  precio: number;
  pago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | null; // null = pendiente
}

export const SALIDAS: SalidaOpcion[] = [
  { id: 'reservas', label: 'Tu página de reservas' },
  { id: 'confirmacion', label: 'La confirmación' },
  { id: 'agenda', label: 'La agenda del día' },
  { id: 'pago', label: 'El pago' },
];

export const NEGOCIO = {
  nombre: 'Barbería La Navaja',
  sucursal: 'Providencia',
  direccion: 'Av. Italia 1240',
  profesional: 'Matías',
  dia: 'Jueves 12 de noviembre',
  apertura: 10 * 60,
  cierre: 19 * 60 + 30,
};

export const SERVICIOS: ServicioDemo[] = [
  { id: 'corte', nombre: 'Corte de pelo', duracion: 45, precio: 12000 },
  { id: 'corte-barba', nombre: 'Corte + barba', duracion: 60, precio: 18000 },
  { id: 'barba', nombre: 'Perfilado de barba', duracion: 30, precio: 8000 },
  { id: 'color', nombre: 'Color', duracion: 90, precio: 35000 },
];

export const RESERVAS: ReservaDemo[] = [
  { inicio: 600, fin: 645, titulo: 'Corte de pelo', cliente: 'Diego R.', precio: 12000, pago: 'Efectivo' },
  { inicio: 660, fin: 720, titulo: 'Corte + barba', cliente: 'Tomás A.', precio: 18000, pago: 'Tarjeta' },
  { inicio: 780, fin: 840, titulo: 'Almuerzo', cliente: null, precio: 0, pago: null },
  { inicio: 870, fin: 900, titulo: 'Perfilado de barba', cliente: 'Felipe M.', precio: 8000, pago: 'Transferencia' },
  { inicio: 960, fin: 1050, titulo: 'Color', cliente: 'Ignacio P.', precio: 35000, pago: null },
  { inicio: 1080, fin: 1125, titulo: 'Corte de pelo', cliente: 'Benjamín S.', precio: 12000, pago: null },
];

/** Horas libres para una duración, en pasos de 15 minutos, sin pisar reservas ni bloqueos. */
export function horasLibres(duracion: number): number[] {
  const libres: number[] = [];
  for (let t = NEGOCIO.apertura; t + duracion <= NEGOCIO.cierre; t += 15) {
    const choca = RESERVAS.some((r) => t < r.fin && t + duracion > r.inicio);
    if (!choca) libres.push(t);
  }
  return libres;
}

export function hora(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, '0')}`; // taste-skill-ignore: minutos de un reloj (10:05)
}

export function pesos(n: number): string {
  return '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
