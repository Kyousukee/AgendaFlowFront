export interface LoginApiResponse {
  accessToken: string;
  /** Se intercambia en POST /auth/refresh cuando caduca el access token. */
  refreshToken: string;
  /** Unix epoch en segundos. */
  expiresAt: number;
  user: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rolId: number;
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
        };
      };
    };
  };
}

export interface UserData {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  empresaId: number;
  rolId: number;
  telefono?: string;
}

export interface AuthResponse {
  token: string;
  usuario: UserData;
  empresa: { id: number; nombre: string; slug: string };
  sucursales: { id: number; empresaId: number; nombre: string; direccion: string; activo: boolean }[];
  empleado: { id: number; sucursalId: number; nombre: string; apellido: string; email: string; telefono?: string; foto?: string; activo: boolean; fechaCreacion: string };
}
