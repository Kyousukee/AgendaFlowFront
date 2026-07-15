import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pago } from '../../../core/interfaces/pago.interface';

const MOCK_PAGOS: Pago[] = [
  {
    id: 1,
    reserva: {
      id: 1,
      codigo: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      empresa: { id: 1, nombre: 'Barberia Los Barones', slug: 'los-barones', activo: true, fechaCreacion: new Date().toISOString() },
      sucursal: { id: 1, empresaId: 1, nombre: 'Sucursal Centro', comuna: 'Providencia', ciudad: 'Santiago', activo: true, fechaCreacion: new Date().toISOString() },
      cliente: { id: 1, nombre: 'Maria', apellido: 'Perez', email: 'maria@gmail.com', telefono: '+56911111111' },
      empleado: { id: 1, sucursalId: 1, nombre: 'Carlos', apellido: 'Mendoza', activo: true, fechaCreacion: new Date().toISOString() },
      servicio: { id: 1, empresaId: 1, nombre: 'Corte de pelo', duracionMinutos: 30, precio: 15000, activo: true, fechaCreacion: new Date().toISOString() },
      fecha: '2026-07-10',
      horaInicio: '10:00:00',
      horaFin: '10:30:00',
      precio: 15000,
      observacion: 'Corte clasico',
      fechaCreacion: new Date().toISOString(),
      estado: { id: 1, nombre: 'Completada' },
    },
    monto: 15000,
    metodoPago: 'Efectivo',
    codigoTransaccion: 'TXN-001-2026',
    fechaPago: '2026-07-10T10:30:00',
    estado: { id: 1, nombre: 'Pagado' },
  },
  {
    id: 2,
    reserva: {
      id: 2,
      codigo: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      empresa: { id: 1, nombre: 'Barberia Los Barones', slug: 'los-barones', activo: true, fechaCreacion: new Date().toISOString() },
      sucursal: { id: 1, empresaId: 1, nombre: 'Sucursal Centro', comuna: 'Providencia', ciudad: 'Santiago', activo: true, fechaCreacion: new Date().toISOString() },
      cliente: { id: 2, nombre: 'Juan', apellido: 'Gonzalez', email: 'juan@gmail.com', telefono: '+56922222222' },
      empleado: { id: 2, sucursalId: 1, nombre: 'Luis', apellido: 'Ramirez', activo: true, fechaCreacion: new Date().toISOString() },
      servicio: { id: 2, empresaId: 1, nombre: 'Barba', duracionMinutos: 20, precio: 10000, activo: true, fechaCreacion: new Date().toISOString() },
      fecha: '2026-07-11',
      horaInicio: '14:00:00',
      horaFin: '14:20:00',
      precio: 10000,
      fechaCreacion: new Date().toISOString(),
      estado: { id: 1, nombre: 'Completada' },
    },
    monto: 10000,
    metodoPago: 'Tarjeta de credito',
    codigoTransaccion: 'TXN-002-2026',
    fechaPago: '2026-07-11T14:20:00',
    estado: { id: 2, nombre: 'Pendiente' },
  },
  {
    id: 3,
    reserva: {
      id: 3,
      codigo: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      empresa: { id: 1, nombre: 'Barberia Los Barones', slug: 'los-barones', activo: true, fechaCreacion: new Date().toISOString() },
      sucursal: { id: 2, empresaId: 1, nombre: 'Sucursal Las Condes', comuna: 'Las Condes', ciudad: 'Santiago', activo: true, fechaCreacion: new Date().toISOString() },
      cliente: { id: 3, nombre: 'Ana', apellido: 'Torres', email: 'ana@gmail.com', telefono: '+56933333333' },
      empleado: { id: 3, sucursalId: 2, nombre: 'Pedro', apellido: 'Hernandez', activo: true, fechaCreacion: new Date().toISOString() },
      servicio: { id: 3, empresaId: 1, nombre: 'Coloracion', duracionMinutos: 60, precio: 35000, activo: true, fechaCreacion: new Date().toISOString() },
      fecha: '2026-07-12',
      horaInicio: '11:00:00',
      horaFin: '12:00:00',
      precio: 35000,
      observacion: 'Coloracion completa rubia',
      fechaCreacion: new Date().toISOString(),
      estado: { id: 1, nombre: 'Completada' },
    },
    monto: 35000,
    metodoPago: 'Webpay',
    codigoTransaccion: 'WEB-003-2026',
    fechaPago: '2026-07-12T12:00:00',
    estado: { id: 1, nombre: 'Pagado' },
  },
  {
    id: 4,
    reserva: {
      id: 4,
      codigo: 'd4e5f6a7-b8c9-0123-defa-234567890123',
      empresa: { id: 1, nombre: 'Barberia Los Barones', slug: 'los-barones', activo: true, fechaCreacion: new Date().toISOString() },
      sucursal: { id: 1, empresaId: 1, nombre: 'Sucursal Centro', comuna: 'Providencia', ciudad: 'Santiago', activo: true, fechaCreacion: new Date().toISOString() },
      cliente: { id: 4, nombre: 'Roberto', apellido: 'Silva', email: 'roberto@gmail.com', telefono: '+56944444444' },
      empleado: { id: 1, sucursalId: 1, nombre: 'Carlos', apellido: 'Mendoza', activo: true, fechaCreacion: new Date().toISOString() },
      servicio: { id: 4, empresaId: 1, nombre: 'Cejas', duracionMinutos: 15, precio: 5000, activo: true, fechaCreacion: new Date().toISOString() },
      fecha: '2026-07-13',
      horaInicio: '09:00:00',
      horaFin: '09:15:00',
      precio: 5000,
      fechaCreacion: new Date().toISOString(),
      estado: { id: 3, nombre: 'Cancelada' },
    },
    monto: 5000,
    metodoPago: 'Efectivo',
    codigoTransaccion: 'TXN-004-2026',
    fechaPago: '2026-07-13T09:15:00',
    estado: { id: 4, nombre: 'Rechazado' },
  },
  {
    id: 5,
    reserva: {
      id: 5,
      codigo: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      empresa: { id: 1, nombre: 'Barberia Los Barones', slug: 'los-barones', activo: true, fechaCreacion: new Date().toISOString() },
      sucursal: { id: 2, empresaId: 1, nombre: 'Sucursal Las Condes', comuna: 'Las Condes', ciudad: 'Santiago', activo: true, fechaCreacion: new Date().toISOString() },
      cliente: { id: 5, nombre: 'Laura', apellido: 'Soto', email: 'laura@gmail.com', telefono: '+56955555555' },
      empleado: { id: 2, sucursalId: 1, nombre: 'Luis', apellido: 'Ramirez', activo: true, fechaCreacion: new Date().toISOString() },
      servicio: { id: 5, empresaId: 1, nombre: 'Lavado y secado', duracionMinutos: 25, precio: 8000, activo: true, fechaCreacion: new Date().toISOString() },
      fecha: '2026-07-14',
      horaInicio: '16:00:00',
      horaFin: '16:25:00',
      precio: 8000,
      observacion: 'Hidratacion profunda',
      fechaCreacion: new Date().toISOString(),
      estado: { id: 1, nombre: 'Completada' },
    },
    monto: 8000,
    metodoPago: 'Transferencia',
    codigoTransaccion: 'TRANS-005-2026',
    fechaPago: '2026-07-14T16:25:00',
    estado: { id: 1, nombre: 'Pagado' },
  },
  {
    id: 6,
    reserva: {
      id: 6,
      codigo: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
      empresa: { id: 1, nombre: 'Barberia Los Barones', slug: 'los-barones', activo: true, fechaCreacion: new Date().toISOString() },
      sucursal: { id: 2, empresaId: 1, nombre: 'Sucursal Las Condes', comuna: 'Las Condes', ciudad: 'Santiago', activo: true, fechaCreacion: new Date().toISOString() },
      cliente: { id: 6, nombre: 'Pedro', apellido: 'Munoz', email: 'pedro.m@gmail.com', telefono: '+56966666666' },
      empleado: { id: 3, sucursalId: 2, nombre: 'Pedro', apellido: 'Hernandez', activo: true, fechaCreacion: new Date().toISOString() },
      servicio: { id: 1, empresaId: 1, nombre: 'Corte de pelo', duracionMinutos: 30, precio: 15000, activo: true, fechaCreacion: new Date().toISOString() },
      fecha: '2026-07-15',
      horaInicio: '13:00:00',
      horaFin: '13:30:00',
      precio: 15000,
      fechaCreacion: new Date().toISOString(),
      estado: { id: 2, nombre: 'Programada' },
    },
    monto: 15000,
    metodoPago: 'Webpay',
    codigoTransaccion: 'WEB-006-2026',
    fechaPago: '2026-07-15T13:30:00',
    estado: { id: 5, nombre: 'Anulado' },
  },
];

@Injectable({ providedIn: 'root' })
export class PagosService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'agendaflow_pagos';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        this.persistir(MOCK_PAGOS);
      }
    }
  }

  getByEmpresa(empresaId: number): Observable<Pago[]> {
    return this.obtenerTodos().pipe(
      map((pagos) =>
        pagos.filter((p) => p.reserva.empresa.id === empresaId),
      ),
    );
  }

  getById(id: number): Observable<Pago | undefined> {
    return this.obtenerTodos().pipe(
      map((pagos) => pagos.find((p) => p.id === id)),
    );
  }

  private obtenerTodos(): Observable<Pago[]> {
    return of(this.obtenerTodosSync());
  }

  private obtenerTodosSync(): Pago[] {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : MOCK_PAGOS;
    }
    return MOCK_PAGOS;
  }

  private persistir(pagos: Pago[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pagos));
    }
  }
}
