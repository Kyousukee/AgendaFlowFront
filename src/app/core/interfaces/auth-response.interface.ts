export interface LoginApiResponse {
  accessToken: string;
  user: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rolId: number;
    emailVerificado: boolean;
    /** SPEC 08: solo el recepcionista (rol 2). Es su única sucursal. */
    sucursal?: { id: number; nombre: string | null } | null;
    /** El recepcionista no suele tener empleado: llega `null`. */
    empleado: {
      id: number;
      nombre: string;
      apellido: string;
      email: string;
      telefono: string | null;
      foto: string | null;
      sucursal: {
        id: number;
        nombre: string;
        direccion: string;
        empresa: {
          id: number;
          nombre: string;
          slug: string;
        } | null;
      } | null;
    } | null;
  };
}

/** Campos del JWT que usa el front. Solo se leen, nunca se confía en ellos para permisos. */
export interface JwtPayload {
  sub: number;
  rolId: number;
  empresaId: number;
  sucursalId?: number;
}

export interface UserData {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  empresaId: number;
  rolId: number;
  telefono?: string;
  /** Opcional: una sesión guardada antes de la verificación de email no lo trae. */
  emailVerificado?: boolean;
}

export interface AuthResponse {
  token: string;
  usuario: UserData;
  empresa: { id: number; nombre: string; slug: string };
  sucursales: { id: number; empresaId: number; nombre: string; direccion: string; activo: boolean }[];
  empleado: { id: number; sucursalId: number; nombre: string; apellido: string; email: string; telefono?: string; foto?: string; activo: boolean; fechaCreacion: string };
}
