export interface BloqueoAgenda {
  id: number;
  empleadoId: number;
  empleado?: { id: number; nombre: string; apellido?: string };
  empleadoNombre?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}
