export interface EmailVerificadoResponse {
  emailVerificado: boolean;
}

export interface MensajeCuentaResponse {
  message: string;
}

/** SPEC 08: GET /auth/invitacion/:token. */
export interface InvitacionVista {
  nombre: string;
  email: string;
  empresa: string | null;
  sucursal: string | null;
}
