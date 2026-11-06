import { ESTADOS_RESERVA, liberaHora, nombreEstadoReserva } from './estados-reserva';

describe('estados de reserva', () => {
  it('usa los IDs del catálogo de la API', () => {
    expect(ESTADOS_RESERVA.map((estado) => `${estado.id}:${estado.nombre}`)).toEqual([
      '1:Programada',
      '2:Completada',
      '3:Pagado',
      '4:Pendiente',
      '5:Cancelada',
      '6:Rechazado',
      '7:Anulado',
    ]);
  });

  it('solo Cancelada, Rechazado y Anulado liberan la hora', () => {
    const liberan = ESTADOS_RESERVA.filter((estado) => liberaHora(estado.id));
    expect(liberan.map((estado) => estado.nombre)).toEqual(['Cancelada', 'Rechazado', 'Anulado']);
  });

  it('Pagado no se confunde con una cancelación', () => {
    expect(nombreEstadoReserva(3)).toBe('Pagado');
    expect(liberaHora(3)).toBe(false);
  });
});
