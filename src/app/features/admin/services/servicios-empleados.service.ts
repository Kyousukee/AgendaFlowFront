import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServicioEmpleado } from '../../../core/interfaces/servicio-empleado.interface';

const MOCK_SERVICIOS_EMPLEADOS: ServicioEmpleado[] = [
  { id: 1, servicioId: 1, empleadoId: 1 },
  { id: 2, servicioId: 2, empleadoId: 1 },
  { id: 3, servicioId: 4, empleadoId: 1 },
  { id: 4, servicioId: 2, empleadoId: 2 },
  { id: 5, servicioId: 3, empleadoId: 2 },
  { id: 6, servicioId: 5, empleadoId: 2 },
  { id: 7, servicioId: 1, empleadoId: 3 },
  { id: 8, servicioId: 3, empleadoId: 3 },
  { id: 9, servicioId: 4, empleadoId: 3 },
];

@Injectable({ providedIn: 'root' })
export class ServiciosEmpleadosService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'agendaflow_servicios_empleados';
  private nextId = 10;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        this.persistir(MOCK_SERVICIOS_EMPLEADOS);
      } else {
        const parsed = JSON.parse(stored) as ServicioEmpleado[];
        this.nextId = Math.max(...parsed.map((se) => se.id), 0) + 1;
      }
    }
  }

  getByEmpleado(empleadoId: number): Observable<number[]> {
    return this.obtenerTodos().pipe(
      map((lista) =>
        lista.filter((se) => se.empleadoId === empleadoId).map((se) => se.servicioId),
      ),
    );
  }

  getBySucursal(sucursalId: number, empleadoIds: number[]): Observable<ServicioEmpleado[]> {
    return this.obtenerTodos().pipe(
      map((lista) => lista.filter((se) => empleadoIds.includes(se.empleadoId))),
    );
  }

  save(empleadoId: number, servicioIds: number[]): Observable<void> {
    const todos = this.obtenerTodosSync();
    const filtrados = todos.filter((se) => se.empleadoId !== empleadoId);
    const nuevos = servicioIds.map((servicioId) => ({
      id: this.nextId++,
      servicioId,
      empleadoId,
    }));
    this.persistir([...filtrados, ...nuevos]);
    return of(void 0);
  }

  eliminar(id: number): Observable<void> {
    const todos = this.obtenerTodosSync();
    this.persistir(todos.filter((se) => se.id !== id));
    return of(void 0);
  }

  private obtenerTodos(): Observable<ServicioEmpleado[]> {
    return of(this.obtenerTodosSync());
  }

  private obtenerTodosSync(): ServicioEmpleado[] {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : MOCK_SERVICIOS_EMPLEADOS;
    }
    return MOCK_SERVICIOS_EMPLEADOS;
  }

  private persistir(data: ServicioEmpleado[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }
  }
}
