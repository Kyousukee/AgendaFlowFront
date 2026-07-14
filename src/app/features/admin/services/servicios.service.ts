import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Servicio } from '../../../core/interfaces/servicio.interface';

const MOCK_SERVICIOS: Servicio[] = [
  {
    id: 1,
    empresaId: 1,
    nombre: 'Corte de pelo',
    descripcion: 'Corte de cabello masculino o femilino',
    duracionMinutos: 30,
    precio: 15000,
    color: '#C9A84C',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 2,
    empresaId: 1,
    nombre: 'Barba',
    descripcion: 'Arreglo y perfilado de barba',
    duracionMinutos: 20,
    precio: 10000,
    color: '#60A5FA',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 3,
    empresaId: 1,
    nombre: 'Coloracion',
    descripcion: 'Tinte y coloracion capilar',
    duracionMinutos: 60,
    precio: 35000,
    color: '#F472B6',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 4,
    empresaId: 1,
    nombre: 'Cejas',
    descripcion: 'Diseño y depilacion de cejas',
    duracionMinutos: 15,
    precio: 5000,
    color: '#34D399',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 5,
    empresaId: 1,
    nombre: 'Lavado y secado',
    descripcion: 'Lavado, hidratacion y secado profesional',
    duracionMinutos: 25,
    precio: 8000,
    color: '#A78BFA',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'agendaflow_servicios';
  private nextId = 6;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Servicio[];
        this.nextId = Math.max(...parsed.map((s) => s.id), 0) + 1;
      } else {
        this.persistir(MOCK_SERVICIOS);
      }
    }
  }

  getByEmpresa(empresaId: number): Observable<Servicio[]> {
    return this.obtenerTodos().pipe(
      map((servicios) => servicios.filter((s) => s.empresaId === empresaId && s.activo)),
    );
  }

  crear(servicio: Omit<Servicio, 'id' | 'fechaCreacion'>): Observable<Servicio> {
    const nuevo: Servicio = {
      ...servicio,
      id: this.nextId++,
      fechaCreacion: new Date().toISOString(),
    };
    const todos = this.obtenerTodosSync();
    todos.push(nuevo);
    this.persistir(todos);
    return of(nuevo);
  }

  actualizar(servicio: Servicio): Observable<Servicio> {
    const todos = this.obtenerTodosSync();
    const index = todos.findIndex((s) => s.id === servicio.id);
    if (index !== -1) {
      todos[index] = servicio;
      this.persistir(todos);
    }
    return of(servicio);
  }

  eliminar(id: number): Observable<void> {
    const todos = this.obtenerTodosSync();
    const index = todos.findIndex((s) => s.id === id);
    if (index !== -1) {
      todos[index].activo = false;
      this.persistir(todos);
    }
    return of(void 0);
  }

  private obtenerTodos(): Observable<Servicio[]> {
    return of(this.obtenerTodosSync());
  }

  private obtenerTodosSync(): Servicio[] {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : MOCK_SERVICIOS;
    }
    return MOCK_SERVICIOS;
  }

  private persistir(servicios: Servicio[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(servicios));
    }
  }
}
