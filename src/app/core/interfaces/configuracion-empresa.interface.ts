/** SPEC 06: tipos de anticipo que acepta la API. */
export type TipoAnticipo = 'Monto' | 'Porcentaje' | 'Completo';

export interface ConfiguracionEmpresa {
  id: number;
  empresaId: number;
  permitePagoAnticipado: boolean;
  /** SPEC 06: si es false, el cliente elige pagar ahora o en el local. */
  pagoObligatorio: boolean;
  tipoAnticipo: TipoAnticipo | null;
  montoAnticipo: number;
  tiempoCancelacionHoras: number;
  tiempoReservaMinutos: number;
  permiteSeleccionEmpleado: boolean;
  mostrarPrecios: boolean;
  enviarCorreo: boolean;
  enviarWhatsapp: boolean;
}

export interface EmpresaLogoResponse {
  logo: string;
}

/** Cuerpo de error de NestJS: `message` puede venir como texto o como lista de validaciones. */
export interface ApiErrorBody {
  message?: string | string[];
  statusCode?: number;
}

/** SPEC 06: cuenta Flow del negocio en GET /configuracion-empresa/flow. */
export interface ResumenCuentaFlow {
  configurada: boolean;
  /** Últimos 4 caracteres del apiKey, o null si no hay cuenta. */
  apiKeyFinal: string | null;
}

export interface CuentaFlowSucursal {
  sucursalId: number;
  nombre: string | null;
  activa: boolean;
  cuentaPropia: boolean;
  apiKeyFinal: string | null;
  usaCuentaEmpresa: boolean;
}

/** SPEC 06: GET /configuracion-empresa/flow. Nunca trae la secretKey. */
export interface CuentasFlowEmpresa {
  empresa: ResumenCuentaFlow;
  sucursales: CuentaFlowSucursal[];
}

/** Cuerpo de PUT /configuracion-empresa/flow/... La secretKey solo viaja en esta petición. */
export interface CredencialesFlow {
  apiKey: string;
  secretKey: string;
}
