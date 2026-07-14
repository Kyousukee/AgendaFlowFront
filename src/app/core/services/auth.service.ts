import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Empresa } from '../interfaces/empresa.interface';
import { Sucursal } from '../interfaces/sucursal.interface';
import { Empleado } from '../interfaces/empleado.interface';
import { UserData, AuthResponse } from '../interfaces/auth-response.interface';

const MOCK_EMPRESA: Empresa = {
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
};

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'agendaflow_token';
  private readonly USER_KEY = 'agendaflow_user';
  private readonly EMPRESA_KEY = 'agendaflow_empresa';
  private readonly SUCURSALES_KEY = 'agendaflow_sucursales';
  private readonly SUCURSAL_ACTUAL_KEY = 'agendaflow_sucursal_actual';
  private readonly EMPLEADO_KEY = 'agendaflow_empleado';

  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  isLoggedIn = signal(false);
  currentUser = signal<UserData | null>(null);
  empresa = signal<Empresa | null>(null);
  sucursales = signal<Sucursal[]>([]);
  sucursalActual = signal<Sucursal | null>(null);
  empleado = signal<Empleado | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userJson = localStorage.getItem(this.USER_KEY);
      const empresaJson = localStorage.getItem(this.EMPRESA_KEY);
      const sucursalesJson = localStorage.getItem(this.SUCURSALES_KEY);
      const sucursalActualJson = localStorage.getItem(this.SUCURSAL_ACTUAL_KEY);
      const empleadoJson = localStorage.getItem(this.EMPLEADO_KEY);

      if (token && userJson) {
        this.isLoggedIn.set(true);
        this.currentUser.set(JSON.parse(userJson));
      }
      if (empresaJson) {
        this.empresa.set(JSON.parse(empresaJson));
      }
      if (sucursalesJson) {
        this.sucursales.set(JSON.parse(sucursalesJson));
      }
      if (sucursalActualJson) {
        this.sucursalActual.set(JSON.parse(sucursalActualJson));
      }
      if (empleadoJson) {
        this.empleado.set(JSON.parse(empleadoJson));
      }
    }
  }

  setSession(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.usuario));
      localStorage.setItem(this.EMPRESA_KEY, JSON.stringify(response.empresa));
      localStorage.setItem(this.SUCURSALES_KEY, JSON.stringify(response.sucursales));
      localStorage.setItem(this.EMPLEADO_KEY, JSON.stringify(response.empleado));

      if (response.sucursales.length > 0) {
        localStorage.setItem(this.SUCURSAL_ACTUAL_KEY, JSON.stringify(response.sucursales[0]));
      }
    }

    this.isLoggedIn.set(true);
    this.currentUser.set(response.usuario);
    this.empresa.set(response.empresa);
    this.sucursales.set(response.sucursales);
    this.empleado.set(response.empleado);

    if (response.sucursales.length > 0) {
      this.sucursalActual.set(response.sucursales[0]);
    }

    this.router.navigate(['/admin/home']);
  }

  cambiarSucursal(sucursalId: number): void {
    const suc = this.sucursales().find((s) => s.id === sucursalId);
    if (suc) {
      this.sucursalActual.set(suc);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.SUCURSAL_ACTUAL_KEY, JSON.stringify(suc));
      }
    }
  }

  esAdmin(): boolean {
    return this.currentUser()?.rol === 'admin';
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  login(email: string, _password: string): void {
    const mockResponse: AuthResponse = {
      token: 'mock-token-' + Date.now(),
      usuario: {
        id: 1,
        nombre: 'Usuario',
        apellido: 'Demo',
        email,
        empresaId: 1,
        rol: 'admin',
        telefono: '+56912345678',
      },
      empresa: MOCK_EMPRESA,
      sucursales: MOCK_SUCURSALES,
      empleado: {
        id: 1,
        sucursalId: 1,
        nombre: 'Usuario',
        apellido: 'Demo',
        email,
        telefono: '+56912345678',
        foto: '',
        descripcion: 'Administrador principal',
        activo: true,
        fechaCreacion: new Date().toISOString(),
      },
    };

    this.setSession(mockResponse);
  }

  register(
    nombre: string,
    apellido: string,
    email: string,
    _password: string,
    empresaNombre: string,
    sucursalNombre: string,
  ): void {
    const mockResponse: AuthResponse = {
      token: 'mock-token-' + Date.now(),
      usuario: {
        id: 1,
        nombre,
        apellido,
        email,
        empresaId: 1,
        rol: 'admin',
      },
      empresa: {
        ...MOCK_EMPRESA,
        nombre: empresaNombre,
      },
      sucursales: [
        {
          ...MOCK_SUCURSALES[0],
          nombre: sucursalNombre || 'Sucursal Principal',
        },
      ],
      empleado: {
        id: 1,
        sucursalId: 1,
        nombre,
        apellido,
        email,
        activo: true,
        fechaCreacion: new Date().toISOString(),
      },
    };

    this.setSession(mockResponse);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.EMPRESA_KEY);
      localStorage.removeItem(this.SUCURSALES_KEY);
      localStorage.removeItem(this.SUCURSAL_ACTUAL_KEY);
      localStorage.removeItem(this.EMPLEADO_KEY);
    }

    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.empresa.set(null);
    this.sucursales.set([]);
    this.sucursalActual.set(null);
    this.empleado.set(null);
    this.router.navigate(['/login']);
  }
}
