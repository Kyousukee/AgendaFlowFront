/**
 * Lo que el cliente reservó, para mostrarlo en la confirmación (SPEC 04).
 * La confirmación es su único comprobante: no tiene cuenta ni recibe correo.
 */
export interface ReservaResumen {
  codigo: string;
  servicio: string;
  profesional: string;
  /** Fecha larga ya formateada, por ejemplo "jueves, 5 de noviembre". */
  fecha: string;
  horaInicio: string;
  horaFin: string;
}
