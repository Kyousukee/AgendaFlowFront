/** SPEC 08: un barbero en `GET /reservas/proxima-hora`. Sin cupo: horas y espera en `null`. */
export interface BarberoProximaHora {
  empleadoId: number;
  nombre: string;
  apellido: string | null;
  foto: string | null;
  horaInicio: string | null;
  horaFin: string | null;
  reservasAntes: number;
  /** Minutos desde ahora hasta el hueco. `null` para otra fecha. */
  esperaMinutos: number | null;
}

/** SPEC 08: `GET /reservas/proxima-hora?sucursalId=&servicioId=&fecha=`. */
export interface ProximaHoraResponse {
  fecha: string;
  /** Hora del negocio (America/Santiago), `HH:mm`. */
  ahora: string;
  servicio: { id: number; nombre: string; duracionMinutos: number };
  empleados: BarberoProximaHora[];
}

/** SPEC 08: `POST /reservas`. `empresaId` sale del JWT; un campo extra responde 400. */
export interface CrearReservaPanelDto {
  sucursalId: number;
  servicioId: number;
  empleadoId: number;
  fecha: string;
  horaInicio: string;
  clienteNombre: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  observacion?: string;
}

/** SPEC 08: respuesta `201` de `POST /reservas`. */
export interface ReservaPanelCreada {
  id: number;
  codigo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  precio: number;
  estado: 'Programada';
  origen: 'Panel';
  empleado: { id: number; nombre: string; apellido: string | null };
  cliente: { nombre: string };
  reservasAntes: number;
}

export type OrigenReserva = 'Online' | 'Panel';
