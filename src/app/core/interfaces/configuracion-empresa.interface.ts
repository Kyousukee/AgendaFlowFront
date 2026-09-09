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
