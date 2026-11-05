export interface ConfiguracionEmpresa {
  id: number;
  empresaId: number;
  permitePagoAnticipado: boolean;
  tipoAnticipo: string;
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
