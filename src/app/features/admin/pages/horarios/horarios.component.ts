import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

interface DiaHorario {
  dia: string;
  activo: boolean;
  apertura: string;
  cierre: string;
  descansoInicio: string;
  descansoFin: string;
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatSlideToggleModule, MatSelectModule, FormsModule],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.scss',
})
export class HorariosComponent {
  horarios: DiaHorario[] = [
    { dia: 'Lunes', activo: true, apertura: '09:00', cierre: '18:00', descansoInicio: '13:00', descansoFin: '14:00' },
    { dia: 'Martes', activo: true, apertura: '09:00', cierre: '18:00', descansoInicio: '13:00', descansoFin: '14:00' },
    { dia: 'Miercoles', activo: true, apertura: '09:00', cierre: '18:00', descansoInicio: '13:00', descansoFin: '14:00' },
    { dia: 'Jueves', activo: true, apertura: '09:00', cierre: '19:00', descansoInicio: '13:00', descansoFin: '14:00' },
    { dia: 'Viernes', activo: true, apertura: '09:00', cierre: '20:00', descansoInicio: '13:00', descansoFin: '14:00' },
    { dia: 'Sabado', activo: true, apertura: '10:00', cierre: '15:00', descansoInicio: '', descansoFin: '' },
    { dia: 'Domingo', activo: false, apertura: '09:00', cierre: '14:00', descansoInicio: '', descansoFin: '' },
  ];

  horas = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00',
  ];

  get diasActivos(): number {
    return this.horarios.filter((d) => d.activo).length;
  }
}
