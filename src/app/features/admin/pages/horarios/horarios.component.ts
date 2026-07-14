import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { HorariosService } from '../../services/horarios.service';
import { AuthService } from '../../../../core/services/auth.service';
import { HorarioSucursal } from '../../interfaces/horario-sucursal.interface';

const NOMBRES_DIAS: string[] = [
  '',
  'Lunes',
  'Martes',
  'Miercoles',
  'Jueves',
  'Viernes',
  'Sabado',
  'Domingo',
];

interface DiaHorario {
  dia: string;
  diaSemana: number;
  activo: boolean;
  apertura: string;
  cierre: string;
  descansoInicio: string;
  descansoFin: string;
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.scss',
})
export class HorariosComponent implements OnInit {
  private horariosService = inject(HorariosService);
  private authService = inject(AuthService);

  horarios: DiaHorario[] = [];
  guardando = signal(false);
  cargando = signal(true);

  horas = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
  ];

  private lastSucursalId = 0;

  constructor() {
    effect(() => {
      const suc = this.authService.sucursalActual();
      const sucursalId = suc?.id ?? 0;
      if (sucursalId && sucursalId !== this.lastSucursalId) {
        this.lastSucursalId = sucursalId;
        this.cargarHorarios();
      }
    });
  }

  get diasActivos(): number {
    return this.horarios.filter((d) => d.activo).length;
  }

  ngOnInit(): void {
    this.cargarHorarios();
  }

  cargarHorarios(): void {
    const sucursalId = this.authService.sucursalActual()?.id;
    if (!sucursalId) {
      this.horarios = this.obtenerHorariosPorDefecto();
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.horariosService.getBySucursal(sucursalId).subscribe({
      next: (data) => {
        this.horarios = this.mapearDesdeApi(data);
        this.cargando.set(false);
      },
      error: () => {
        this.horarios = this.obtenerHorariosPorDefecto();
        this.cargando.set(false);
      },
    });
  }

  guardar(): void {
    const sucursalId = this.authService.sucursalActual()?.id;
    if (!sucursalId) return;

    this.guardando.set(true);
    const horariosApi = this.mapearHaciaApi(this.horarios, sucursalId);

    this.horariosService.saveAll(sucursalId, horariosApi).subscribe({
      next: () => this.guardando.set(false),
      error: () => this.guardando.set(false),
    });
  }

  private mapearDesdeApi(data: HorarioSucursal[]): DiaHorario[] {
    const horariosMap = new Map<number, HorarioSucursal>();
    data.forEach((h) => horariosMap.set(h.diaSemana, h));

    return Array.from({ length: 7 }, (_, i) => {
      const diaSemana = i + 1;
      const api = horariosMap.get(diaSemana);
      return {
        dia: NOMBRES_DIAS[diaSemana],
        diaSemana,
        activo: api?.abierto ?? false,
        apertura: api?.horaInicio ?? '09:00',
        cierre: api?.horaFin ?? '18:00',
        descansoInicio: '',
        descansoFin: '',
      };
    });
  }

  private mapearHaciaApi(horarios: DiaHorario[], sucursalId: number): HorarioSucursal[] {
    return horarios.map((h) => ({
      id: 0,
      sucursalId,
      diaSemana: h.diaSemana,
      horaInicio: h.apertura,
      horaFin: h.cierre,
      abierto: h.activo,
    }));
  }

  private obtenerHorariosPorDefecto(): DiaHorario[] {
    return [
      {
        dia: 'Lunes',
        diaSemana: 1,
        activo: true,
        apertura: '09:00',
        cierre: '18:00',
        descansoInicio: '13:00',
        descansoFin: '14:00',
      },
      {
        dia: 'Martes',
        diaSemana: 2,
        activo: true,
        apertura: '09:00',
        cierre: '18:00',
        descansoInicio: '13:00',
        descansoFin: '14:00',
      },
      {
        dia: 'Miercoles',
        diaSemana: 3,
        activo: true,
        apertura: '09:00',
        cierre: '18:00',
        descansoInicio: '13:00',
        descansoFin: '14:00',
      },
      {
        dia: 'Jueves',
        diaSemana: 4,
        activo: true,
        apertura: '09:00',
        cierre: '19:00',
        descansoInicio: '13:00',
        descansoFin: '14:00',
      },
      {
        dia: 'Viernes',
        diaSemana: 5,
        activo: true,
        apertura: '09:00',
        cierre: '20:00',
        descansoInicio: '13:00',
        descansoFin: '14:00',
      },
      {
        dia: 'Sabado',
        diaSemana: 6,
        activo: true,
        apertura: '10:00',
        cierre: '15:00',
        descansoInicio: '',
        descansoFin: '',
      },
      {
        dia: 'Domingo',
        diaSemana: 7,
        activo: false,
        apertura: '09:00',
        cierre: '14:00',
        descansoInicio: '',
        descansoFin: '',
      },
    ];
  }
}
