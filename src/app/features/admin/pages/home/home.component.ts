import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Service {
  id: number;
  nombre: string;
  duracion: number;
  color: string;
}

interface Slot {
  hora: string;
  horaFin: string;
  estado: 'disponible' | 'ocupado';
  servicio?: Service;
  cliente?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  selectedDay = signal('Lunes 14 de Julio');

  servicios: Service[] = [
    { id: 1, nombre: 'Corte de pelo', duracion: 30, color: '#C9A84C' },
    { id: 2, nombre: 'Barba', duracion: 20, color: '#60A5FA' },
    { id: 3, nombre: 'Coloración', duracion: 60, color: '#F472B6' },
    { id: 4, nombre: 'Cejas', duracion: 15, color: '#34D399' },
    { id: 5, nombre: 'Lavado y secado', duracion: 25, color: '#A78BFA' },
  ];

  slots: Slot[] = [
    { hora: '08:00', horaFin: '08:30', estado: 'disponible' },
    { hora: '08:30', horaFin: '09:00', estado: 'disponible' },
    { hora: '09:00', horaFin: '09:30', estado: 'ocupado', servicio: this.servicios[0], cliente: 'Carlos M.' },
    { hora: '09:30', horaFin: '09:50', estado: 'ocupado', servicio: this.servicios[1], cliente: 'Luis R.' },
    { hora: '09:50', horaFin: '10:00', estado: 'disponible' },
    { hora: '10:00', horaFin: '11:00', estado: 'ocupado', servicio: this.servicios[2], cliente: 'Maria P.' },
    { hora: '11:00', horaFin: '11:15', estado: 'ocupado', servicio: this.servicios[3], cliente: 'Ana G.' },
    { hora: '11:15', horaFin: '11:40', estado: 'ocupado', servicio: this.servicios[4], cliente: 'Sofia L.' },
    { hora: '11:40', horaFin: '12:00', estado: 'disponible' },
    { hora: '12:00', horaFin: '12:30', estado: 'disponible' },
    { hora: '12:30', horaFin: '13:00', estado: 'disponible' },
    { hora: '13:00', horaFin: '13:30', estado: 'ocupado', servicio: this.servicios[0], cliente: 'Pedro H.' },
    { hora: '13:30', horaFin: '14:00', estado: 'disponible' },
    { hora: '14:00', horaFin: '14:30', estado: 'disponible' },
    { hora: '14:30', horaFin: '15:00', estado: 'ocupado', servicio: this.servicios[1], cliente: 'Diego F.' },
    { hora: '15:00', horaFin: '15:30', estado: 'disponible' },
    { hora: '15:30', horaFin: '16:00', estado: 'disponible' },
  ];

  get totalOcupados(): number {
    return this.slots.filter((s) => s.estado === 'ocupado').length;
  }

  get totalDisponibles(): number {
    return this.slots.filter((s) => s.estado === 'disponible').length;
  }
}
