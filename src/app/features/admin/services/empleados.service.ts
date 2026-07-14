import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Empleado } from '../../../core/interfaces/empleado.interface';

const MOCK_EMPLEADOS: Empleado[] = [
  {
    id: 1,
    sucursalId: 1,
    nombre: 'Carlos',
    apellido: 'Mendoza',
    email: 'carlos@losbarones.cl',
    telefono: '+56911111111',
    foto: '',
    descripcion: 'Barbero senior, especialista en cortes clasicos',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 2,
    sucursalId: 1,
    nombre: 'Luis',
    apellido: 'Ramirez',
    email: 'luis@losbarones.cl',
    telefono: '+56922222222',
    foto: '',
    descripcion: 'Barbero, especialista en barba y diseños',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 3,
    sucursalId: 2,
    nombre: 'Pedro',
    apellido: 'Hernandez',
    email: 'pedro@losbarones.cl',
    telefono: '+56933333333',
    foto: '',
    descripcion: 'Estilista profesional',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class EmpleadosService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'agendaflow_empleados';
  private nextId = 4;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Empleado[];
        this.nextId = Math.max(...parsed.map((e) => e.id), 0) + 1;
      } else {
        this.persistir(MOCK_EMPLEADOS);
      }
    }
  }

  getBySucursal(sucursalId: number): Observable<Empleado[]> {
    return this.obtenerTodos().pipe(
      map((empleados) => empleados.filter((e) => e.sucursalId === sucursalId && e.activo)),
    );
  }

  crear(empleado: Omit<Empleado, 'id' | 'fechaCreacion'>): Observable<Empleado> {
    const nuevo: Empleado = {
      ...empleado,
      id: this.nextId++,
      fechaCreacion: new Date().toISOString(),
    };
    const todos = this.obtenerTodosSync();
    todos.push(nuevo);
    this.persistir(todos);
    return of(nuevo);
  }

  actualizar(empleado: Empleado): Observable<Empleado> {
    const todos = this.obtenerTodosSync();
    const index = todos.findIndex((e) => e.id === empleado.id);
    if (index !== -1) {
      todos[index] = empleado;
      this.persistir(todos);
    }
    return of(empleado);
  }

  eliminar(id: number): Observable<void> {
    const todos = this.obtenerTodosSync();
    const index = todos.findIndex((e) => e.id === id);
    if (index !== -1) {
      todos[index].activo = false;
      this.persistir(todos);
    }
    return of(void 0);
  }

  private obtenerTodos(): Observable<Empleado[]> {
    return of(this.obtenerTodosSync());
  }

  private obtenerTodosSync(): Empleado[] {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : MOCK_EMPLEADOS;
    }
    return MOCK_EMPLEADOS;
  }

  private persistir(empleados: Empleado[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(empleados));
    }
  }
}
