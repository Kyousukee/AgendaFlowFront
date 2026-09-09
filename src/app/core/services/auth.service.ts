import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Empresa } from '../interfaces/empresa.interface';
import { Sucursal } from '../interfaces/sucursal.interface';
import { Empleado } from '../interfaces/empleado.interface';
import { UserData, AuthResponse } from '../interfaces/auth-response.interface';
import { RegisterRequest } from '../../features/auth/interfaces/register-request.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'agendaflow_token';
  private readonly REFRESH_KEY = 'agendaflow_refresh';
  private readonly EXPIRES_KEY = 'agendaflow_expires';
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

  // ---------------------------------------------------------------------
  //  Llamadas al backend
  // ---------------------------------------------------------------------

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(tap((res) => this.setSession(res)));
  }

  register(dto: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, dto)
      .pipe(tap((res) => this.setSession(res)));
  }

  /**
   * Intercambia el refresh token por una sesion nueva. Lo usa el interceptor
   * cuando una peticion recibe 401. No llama a setSession() a proposito: no
   * debe navegar a /admin/home en mitad de una peticion cualquiera.
   */
  refresh(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {
        refreshToken: this.getRefreshToken(),
      })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  // ---------------------------------------------------------------------
  //  Sesion
  // ---------------------------------------------------------------------

  /** Persiste la sesion y actualiza las senales, sin navegar. */
  private guardarSesion(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, response.accessToken);
      localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
      localStorage.setItem(this.EXPIRES_KEY, String(response.expiresAt));
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      localStorage.setItem(this.EMPRESA_KEY, JSON.stringify(response.empresa));
      localStorage.setItem(
        this.SUCURSALES_KEY,
        JSON.stringify(response.sucursales),
      );
      localStorage.setItem(
        this.EMPLEADO_KEY,
        JSON.stringify(response.user.empleado),
      );

      if (response.sucursales.length > 0) {
        localStorage.setItem(
          this.SUCURSAL_ACTUAL_KEY,
          JSON.stringify(response.sucursales[0]),
        );
      }
    }

    this.isLoggedIn.set(true);
    this.currentUser.set(response.user);
    this.empresa.set(response.empresa);
    this.sucursales.set(response.sucursales);
    this.empleado.set(response.user.empleado);

    if (response.sucursales.length > 0) {
      this.sucursalActual.set(response.sucursales[0]);
    }
  }

  /** Guarda la sesion y entra al panel. Para login y registro. */
  setSession(response: AuthResponse): void {
    this.guardarSesion(response);
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
    return this.currentUser()?.rolId === 1;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.REFRESH_KEY);
    }
    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
      localStorage.removeItem(this.EXPIRES_KEY);
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
