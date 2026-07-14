export interface HorarioSucursal {
  id: number;
  sucursalId: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  abierto: boolean;
}
