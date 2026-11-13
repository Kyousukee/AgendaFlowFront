/** SPEC 08: un recepcionista en `GET /equipo`. */
export interface MiembroEquipo {
  id: number;
  nombre: string;
  apellido: string | null;
  email: string;
  sucursal: { id: number; nombre: string | null } | null;
  activo: boolean;
  invitacionPendiente: boolean;
  desactivadoPorSuscripcion: boolean;
}

/** SPEC 08: `POST /equipo`. */
export interface InvitarMiembroDto {
  nombre: string;
  apellido?: string;
  email: string;
  sucursalId: number;
}

/** SPEC 08: `PATCH /equipo/:id`. Cambiar `sucursalId` o desactivar cierra su sesión. */
export interface ActualizarMiembroDto {
  nombre?: string;
  apellido?: string;
  sucursalId?: number;
  activo?: boolean;
}
