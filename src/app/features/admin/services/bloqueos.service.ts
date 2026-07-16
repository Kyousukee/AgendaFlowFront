import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BloqueoAgenda } from '../../../core/interfaces/bloqueo-agenda.interface';

const MOCK_BLOQUEOS: BloqueoAgenda[] = [
  {
    id: 1,
    empleadoId: 1,
    empleadoNombre: 'Carlos Mendoza',
    fecha: '2026-07-20',
    horaInicio: '09:00',
    horaFin: '12:00',
    motivo: 'Reunion personal',
  },
  {
    id: 2,
    empleadoId: 2,
    empleadoNombre: 'Luis Ramirez',
    fecha: '2026-07-21',
    horaInicio: '14:00',
    horaFin: '16:00',
    motivo: 'Capacitacion',
  },
  {
    id: 3,
    empleadoId: 3,
    empleadoNombre: 'Pedro Hernandez',
    fecha: '2026-07-18',
    horaInicio: '10:00',
    horaFin: '11:00',
    motivo: 'Descanso medico',
  },
];

@Injectable({ providedIn: 'root' })
export class BloqueosService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'agendaflow_bloqueos';
  private nextId = 4;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        this.persistir(MOCK_BLOQUEOS);
      } else {
        const parsed = JSON.parse(stored) as BloqueoAgenda[];
        this.nextId = Math.max(...parsed.map((b) => b.id), 0) + 1;
      }
    }
  }

  getByEmpleado(empleadoId: number): Observable<BloqueoAgenda[]> {
    return this.obtenerTodos().pipe(
      map((bloqueos) => bloqueos.filter((b) => b.empleadoId === empleadoId)),
    );
  }

  getBySucursal(empleadoIds: number[]): Observable<BloqueoAgenda[]> {
    return this.obtenerTodos().pipe(
      map((bloqueos) => bloqueos.filter((b) => empleadoIds.includes(b.empleadoId))),
    );
  }

  crear(bloqueo: Omit<BloqueoAgenda, 'id'>): Observable<BloqueoAgenda> {
    const nuevo: BloqueoAgenda = {
      ...bloqueo,
      id: this.nextId++,
    };
    const todos = this.obtenerTodosSync();
    todos.push(nuevo);
    this.persistir(todos);
    return of(nuevo);
  }

  actualizar(bloqueo: BloqueoAgenda): Observable<BloqueoAgenda> {
    const todos = this.obtenerTodosSync();
    const index = todos.findIndex((b) => b.id === bloqueo.id);
    if (index !== -1) {
      todos[index] = bloqueo;
      this.persistir(todos);
    }
    return of(bloqueo);
  }

  eliminar(id: number): Observable<void> {
    const todos = this.obtenerTodosSync();
    this.persistir(todos.filter((b) => b.id !== id));
    return of(void 0);
  }

  private obtenerTodos(): Observable<BloqueoAgenda[]> {
    return of(this.obtenerTodosSync());
  }

  private obtenerTodosSync(): BloqueoAgenda[] {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : MOCK_BLOQUEOS;
    }
    return MOCK_BLOQUEOS;
  }

  private persistir(data: BloqueoAgenda[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }
  }
}
