import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Empresa } from '../../../core/interfaces/empresa.interface';
import { Sucursal } from '../../../core/interfaces/sucursal.interface';
import { Servicio } from '../../../core/interfaces/servicio.interface';
import { Empleado } from '../../../core/interfaces/empleado.interface';
import { HorarioSucursal } from '../../admin/interfaces/horario-sucursal.interface';
import { BloqueoAgenda } from '../../../core/interfaces/bloqueo-agenda.interface';
import { ServicioEmpleado } from '../../../core/interfaces/servicio-empleado.interface';
import { Reserva } from '../../../core/interfaces/reserva.interface';

const MOCK_EMPRESAS: Empresa[] = [
  {
    id: 1,
    nombre: 'Barberia Los Barones',
    nombreComercial: 'Los Barones',
    slug: 'los-barones',
    descripcion: 'Barberia premium en el corazon de Santiago',
    email: 'contacto@losbarones.cl',
    telefono: '+56912345678',
    whatsapp: '+56912345678',
    logo: '',
    banner: '',
    colorPrincipal: '#C9A84C',
    colorSecundario: '#1A1A1A',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  },
];

const MOCK_SUCURSALES: Sucursal[] = [
  {
    id: 1,
    empresaId: 1,
    nombre: 'Sucursal Centro',
    direccion: 'Av. Libertador 1234',
    comuna: 'Providencia',
    ciudad: 'Santiago',
    region: 'Metropolitana',
    pais: 'Chile',
    latitud: -33.4489,
    longitud: -70.6693,
    telefono: '+56912345678',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 2,
    empresaId: 1,
    nombre: 'Sucursal Las Condes',
    direccion: 'Av. Apoquindo 5678',
    comuna: 'Las Condes',
    ciudad: 'Santiago',
    region: 'Metropolitana',
    pais: 'Chile',
    latitud: -33.415,
    longitud: -70.585,
    telefono: '+56987654321',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  },
];

const MOCK_SERVICIOS: Servicio[] = [
  { id: 1, empresaId: 1, nombre: 'Corte de pelo', descripcion: 'Corte de cabello masculino o femenino', duracionMinutos: 30, precio: 15000, color: '#C9A84C', activo: true, fechaCreacion: new Date().toISOString() },
  { id: 2, empresaId: 1, nombre: 'Barba', descripcion: 'Arreglo y perfilado de barba', duracionMinutos: 20, precio: 10000, color: '#60A5FA', activo: true, fechaCreacion: new Date().toISOString() },
  { id: 3, empresaId: 1, nombre: 'Coloracion', descripcion: 'Tinte y coloracion capilar', duracionMinutos: 60, precio: 35000, color: '#F472B6', activo: true, fechaCreacion: new Date().toISOString() },
  { id: 4, empresaId: 1, nombre: 'Cejas', descripcion: 'Diseno y depilacion de cejas', duracionMinutos: 15, precio: 5000, color: '#34D399', activo: true, fechaCreacion: new Date().toISOString() },
  { id: 5, empresaId: 1, nombre: 'Lavado y secado', descripcion: 'Lavado, hidratacion y secado profesional', duracionMinutos: 25, precio: 8000, color: '#A78BFA', activo: true, fechaCreacion: new Date().toISOString() },
];

const MOCK_EMPLEADOS: Empleado[] = [
  { id: 1, sucursalId: 1, nombre: 'Carlos', apellido: 'Mendoza', email: 'carlos@losbarones.cl', telefono: '+56911111111', foto: '', descripcion: 'Barbero senior, especialista en cortes clasicos', activo: true, fechaCreacion: new Date().toISOString() },
  { id: 2, sucursalId: 1, nombre: 'Luis', apellido: 'Ramirez', email: 'luis@losbarones.cl', telefono: '+56922222222', foto: '', descripcion: 'Barbero, especialista en barba y disenos', activo: true, fechaCreacion: new Date().toISOString() },
  { id: 3, sucursalId: 2, nombre: 'Pedro', apellido: 'Hernandez', email: 'pedro@losbarones.cl', telefono: '+56933333333', foto: '', descripcion: 'Estilista profesional', activo: true, fechaCreacion: new Date().toISOString() },
];

const MOCK_HORARIOS: HorarioSucursal[] = [
  { id: 1, sucursalId: 1, diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 2, sucursalId: 1, diaSemana: 2, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 3, sucursalId: 1, diaSemana: 3, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 4, sucursalId: 1, diaSemana: 4, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 5, sucursalId: 1, diaSemana: 5, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 6, sucursalId: 1, diaSemana: 6, horaInicio: '09:00', horaFin: '14:00', abierto: true },
  { id: 7, sucursalId: 1, diaSemana: 7, horaInicio: '00:00', horaFin: '00:00', abierto: false },
  { id: 8, sucursalId: 2, diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 9, sucursalId: 2, diaSemana: 2, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 10, sucursalId: 2, diaSemana: 3, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 11, sucursalId: 2, diaSemana: 4, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 12, sucursalId: 2, diaSemana: 5, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 13, sucursalId: 2, diaSemana: 6, horaInicio: '10:00', horaFin: '14:00', abierto: true },
  { id: 14, sucursalId: 2, diaSemana: 7, horaInicio: '00:00', horaFin: '00:00', abierto: false },
];

const MOCK_BLOQUEOS: BloqueoAgenda[] = [
  { id: 1, empleadoId: 1, empleadoNombre: 'Carlos Mendoza', fecha: '2026-07-20', horaInicio: '09:00', horaFin: '12:00', motivo: 'Reunion personal' },
  { id: 2, empleadoId: 2, empleadoNombre: 'Luis Ramirez', fecha: '2026-07-21', horaInicio: '14:00', horaFin: '16:00', motivo: 'Capacitacion' },
];

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
export class ReservarPublicService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY_RESERVAS = 'agendaflow_reservas_public';
  private nextReservaId = 100;

  getEmpresaBySlug(slug: string): Observable<Empresa | undefined> {
    return of(MOCK_EMPRESAS.find((e) => e.slug === slug && e.activo));
  }

  getSucursal(id: number): Observable<Sucursal | undefined> {
    return of(MOCK_SUCURSALES.find((s) => s.id === id && s.activo));
  }

  getServiciosByEmpresa(empresaId: number): Observable<Servicio[]> {
    return of(MOCK_SERVICIOS.filter((s) => s.empresaId === empresaId && s.activo));
  }

  getEmpleadosBySucursal(sucursalId: number): Observable<Empleado[]> {
    return of(MOCK_EMPLEADOS.filter((e) => e.sucursalId === sucursalId && e.activo));
  }

  getHorariosBySucursal(sucursalId: number): Observable<HorarioSucursal[]> {
    return of(MOCK_HORARIOS.filter((h) => h.sucursalId === sucursalId));
  }

  getBloqueosBySucursal(empleadoIds: number[]): Observable<BloqueoAgenda[]> {
    return of(MOCK_BLOQUEOS.filter((b) => empleadoIds.includes(b.empleadoId)));
  }

  getServiciosEmpleados(sucursalId: number): Observable<ServicioEmpleado[]> {
    const empleadoIds = MOCK_EMPLEADOS
      .filter((e) => e.sucursalId === sucursalId)
      .map((e) => e.id);
    return of(MOCK_SERVICIOS_EMPLEADOS.filter((se) => empleadoIds.includes(se.empleadoId)));
  }

  getEmpleadosByServicio(sucursalId: number, servicioId: number): Observable<Empleado[]> {
    const empleadoIds = MOCK_SERVICIOS_EMPLEADOS
      .filter((se) => se.servicioId === servicioId)
      .map((se) => se.empleadoId);
    const sucursalEmpleados = MOCK_EMPLEADOS
      .filter((e) => e.sucursalId === sucursalId && e.activo)
      .map((e) => e.id);
    const ids = empleadoIds.filter((id) => sucursalEmpleados.includes(id));
    return of(MOCK_EMPLEADOS.filter((e) => ids.includes(e.id)));
  }

  getHorariosDisponibles(
    sucursalId: number,
    empleadoId: number,
    servicioId: number,
    fecha: string,
  ): Observable<string[]> {
    const servicio = MOCK_SERVICIOS.find((s) => s.id === servicioId);
    if (!servicio) return of([]);

    const date = new Date(fecha + 'T12:00:00');
    const diaSemana = date.getDay() + 1;

    const horario = MOCK_HORARIOS.find(
      (h) => h.sucursalId === sucursalId && h.diaSemana === diaSemana && h.abierto,
    );
    if (!horario) return of([]);

    const bloqueosDelDia = MOCK_BLOQUEOS.filter(
      (b) =>
        b.empleadoId === empleadoId &&
        b.fecha === fecha,
    );

    const horas: string[] = [];
    const [aperturaH, aperturaM] = horario.horaInicio.split(':').map(Number);
    const [cierreH, cierreM] = horario.horaFin.split(':').map(Number);
    const duracion = servicio.duracionMinutos;

    let actual = aperturaH * 60 + aperturaM;
    const fin = cierreH * 60 + cierreM;

    while (actual + duracion <= fin) {
      const h = Math.floor(actual / 60);
      const m = actual % 60;
      const horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      const finH = Math.floor((actual + duracion) / 60);
      const finM = (actual + duracion) % 60;
      const horaFinStr = `${finH.toString().padStart(2, '0')}:${finM.toString().padStart(2, '0')}`;

      const ocupado = bloqueosDelDia.some((b) => {
        const bInicio = this.timeToMinutes(b.horaInicio);
        const bFin = this.timeToMinutes(b.horaFin);
        return actual < bFin && (actual + duracion) > bInicio;
      });

      if (!ocupado) {
        horas.push(horaStr);
      }

      actual += 30;
    }

    return of(horas);
  }

  crearReserva(data: {
    empresaId: number;
    sucursalId: number;
    servicioId: number;
    empleadoId: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    clienteNombre: string;
    clienteApellido: string;
    clienteEmail: string;
    clienteTelefono: string;
    observacion: string;
  }): Observable<Reserva> {
    const servicio = MOCK_SERVICIOS.find((s) => s.id === data.servicioId)!;
    const empleado = MOCK_EMPLEADOS.find((e) => e.id === data.empleadoId)!;
    const sucursal = MOCK_SUCURSALES.find((s) => s.id === data.sucursalId)!;
    const empresa = MOCK_EMPRESAS.find((e) => e.id === data.empresaId)!;

    const reserva: Reserva = {
      id: this.nextReservaId++,
      codigo: crypto.randomUUID(),
      empresa,
      sucursal,
      cliente: {
        id: 0,
        nombre: data.clienteNombre,
        apellido: data.clienteApellido,
        email: data.clienteEmail,
        telefono: data.clienteTelefono,
      },
      empleado,
      servicio,
      fecha: data.fecha,
      horaInicio: data.horaInicio + ':00',
      horaFin: data.horaFin + ':00',
      precio: servicio.precio,
      observacion: data.observacion || undefined,
      fechaCreacion: new Date().toISOString(),
      estado: { id: 1, nombre: 'Programada' },
    };

    const reservas = this.obtenerReservasSync();
    reservas.push(reserva);
    this.persistirReservas(reservas);

    return of(reserva);
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private obtenerReservasSync(): Reserva[] {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY_RESERVAS);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  private persistirReservas(reservas: Reserva[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY_RESERVAS, JSON.stringify(reservas));
    }
  }
}
