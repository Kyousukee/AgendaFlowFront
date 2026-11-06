/** Catálogo de estados de reserva. Los IDs son los de `schema.sql` en la API (tipo `Reserva`). */
export const ESTADOS_RESERVA = [
  { id: 1, nombre: 'Programada' },
  { id: 2, nombre: 'Completada' },
  { id: 3, nombre: 'Pagado' },
  { id: 4, nombre: 'Pendiente' },
  { id: 5, nombre: 'Cancelada' },
  { id: 6, nombre: 'Rechazado' },
  { id: 7, nombre: 'Anulado' },
] as const;

/** Estados que dejan la hora libre; la API aplica la misma regla al calcular la ocupación. */
const ESTADOS_QUE_LIBERAN_HORA: readonly number[] = [5, 6, 7];

export function liberaHora(estadoId: number): boolean {
  return ESTADOS_QUE_LIBERAN_HORA.includes(estadoId);
}

export function nombreEstadoReserva(estadoId: number): string {
  return ESTADOS_RESERVA.find((estado) => estado.id === estadoId)?.nombre ?? '';
}
