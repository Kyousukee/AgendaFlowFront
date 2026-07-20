import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Empresa } from '../interfaces/empresa.interface';
import { Sucursal } from '../interfaces/sucursal.interface';
import { Empleado } from '../interfaces/empleado.interface';
import { UserData, LoginApiResponse } from '../interfaces/auth-response.interface';
import { RegisterRequest } from '../../features/auth/interfaces/register-request.interface';
import { environment } from '../../../environments/environment';

export const SUCURSAL_UPDATED = 'agendaflow_sucursal_updated';

interface ApiEmpresa {
  id: number;
  nombre: string;
  slug: string;
}

interface ApiSucursal {
  id: number;
  nombre: string;
  direccion: string;
}

interface ApiEmpleado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  foto: string | null;
  sucursal: ApiSucursal & { empresa: ApiEmpresa };
}

interface ApiUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rolId: number;
  empleado: ApiEmpleado;
}

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
  private http = inject(HttpClient);

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
        this.cargarSucursales();
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

  login(email: string, password: string): Observable<LoginApiResponse> {
    return this.http
      .post<LoginApiResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => this.handleLoginResponse(response)),
        catchError((error) => {
          let message = 'Error al iniciar sesion';
          if (error.status === 401) {
            message = 'Email o contrasena incorrectos';
          } else if (error.status === 0) {
            message = 'No se pudo conectar con el servidor';
          }
          return throwError(() => new Error(message));
        }),
      );
  }

  private handleLoginResponse(response: LoginApiResponse): void {
    const { accessToken, user } = response;
    const apiUser: ApiUser = user as ApiUser;
    const sucursal = apiUser.empleado.sucursal;
    const apiEmpresa: ApiEmpresa = sucursal.empresa;

    const userData: UserData = {
      id: apiUser.id,
      nombre: apiUser.nombre,
      apellido: apiUser.apellido,
      email: apiUser.email,
      empresaId: apiEmpresa.id,
      rolId: apiUser.rolId,
      telefono: apiUser.empleado.telefono ?? undefined,
    };

    const empresaData: Empresa = {
      id: apiEmpresa.id,
      nombre: apiEmpresa.nombre,
      slug: apiEmpresa.slug,
      activo: true,
      fechaCreacion: new Date().toISOString(),
    };

    const sucursalData: Sucursal = {
      id: sucursal.id,
      empresaId: apiEmpresa.id,
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      activo: true,
      fechaCreacion: new Date().toISOString(),
    };

    const empleadoData: Empleado = {
      id: apiUser.empleado.id,
      sucursalId: sucursal.id,
      nombre: apiUser.empleado.nombre,
      apellido: apiUser.empleado.apellido,
      email: apiUser.empleado.email,
      telefono: apiUser.empleado.telefono ?? undefined,
      foto: apiUser.empleado.foto ?? undefined,
      activo: true,
      fechaCreacion: new Date().toISOString(),
    };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      localStorage.setItem(this.EMPRESA_KEY, JSON.stringify(empresaData));
      localStorage.setItem(this.SUCURSALES_KEY, JSON.stringify([sucursalData]));
      localStorage.setItem(this.SUCURSAL_ACTUAL_KEY, JSON.stringify(sucursalData));
      localStorage.setItem(this.EMPLEADO_KEY, JSON.stringify(empleadoData));
    }

    this.isLoggedIn.set(true);
    this.currentUser.set(userData);
    this.empresa.set(empresaData);
    this.sucursales.set([sucursalData]);
    this.sucursalActual.set(sucursalData);
    this.empleado.set(empleadoData);

    this.router.navigate(['/admin/home']);
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.http.get<Sucursal[]>(`${environment.apiUrl}/sucursales`).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.sucursales.set(data);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.SUCURSALES_KEY, JSON.stringify(data));
          }
          const actual = this.sucursalActual();
          if (!actual || !data.find((s) => s.id === actual.id)) {
            this.sucursalActual.set(data[0]);
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem(this.SUCURSAL_ACTUAL_KEY, JSON.stringify(data[0]));
            }
          }
        }
      },
      error: () => {},
    });
  }

  cambiarSucursal(sucursalId: number): void {
    const suc = this.sucursales().find((s) => s.id === sucursalId);
    if (suc) {
      this.sucursalActual.set(suc);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.SUCURSAL_ACTUAL_KEY, JSON.stringify(suc));
        window.dispatchEvent(new CustomEvent(SUCURSAL_UPDATED, { detail: suc }));
      }
    }
  }

  esAdmin(): boolean {
    return this.currentUser()?.rolId === 1;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  register(data: RegisterRequest): Observable<LoginApiResponse> {
    return this.http
      .post<LoginApiResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(
        tap((response) => this.handleLoginResponse(response)),
        catchError((error) => {
          let message = 'Error al registrar usuario';
          if (error.status === 409) {
            message = 'El email ya esta registrado';
          } else if (error.status === 400) {
            message = 'Datos invalidos, revisa el formulario';
          } else if (error.status === 0) {
            message = 'No se pudo conectar con el servidor';
          }
          return throwError(() => new Error(message));
        }),
      );
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
