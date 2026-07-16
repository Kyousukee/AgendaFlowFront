export interface BloqueoAgenda {
  id: number;
  empleadoId: number;
  empleadoNombre?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}
