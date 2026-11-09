import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { Location, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { Empresa } from '../interfaces/empresa.interface';
import { Sucursal } from '../interfaces/sucursal.interface';
import { Empleado } from '../interfaces/empleado.interface';
import { UserData, LoginApiResponse } from '../interfaces/auth-response.interface';
import {
  GoogleAuthResponse,
  GoogleRegistroRequest,
  RegistroGooglePendiente,
  requiereRegistroGoogle,
} from '../interfaces/google-auth.interface';
import { ErrorAutenticacion } from '../errors/error-autenticacion';
import { RegisterRequest } from '../../features/auth/interfaces/register-request.interface';
import { environment } from '../../../environments/environment';
import { SuscripcionService } from './suscripcion.service';
import { GoogleIdentityService } from './google-identity.service';

export const SUCURSAL_UPDATED = 'agendaflow_sucursal_updated';

/**
 * Páginas que se abren sin sesión, a veces desde un correo. Si había una sesión vencida guardada,
 * el 401 de sus cargas de fondo la cierra, pero no debe sacar al usuario de la página.
 */
const PAGINAS_DE_CUENTA = [
  '/olvide-contrasena',
  '/verificar-email',
  '/restablecer-contrasena',
  '/registro-google',
];

export const MENSAJE_GOOGLE_INVALIDO = 'No pudimos validar tu cuenta de Google, inténtalo de nuevo';
export const MENSAJE_DEMASIADOS_INTENTOS =
  'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.';

/** Mensaje para un error de `/auth/google` o `/auth/google/registro`. */
function errorGoogle(error: HttpErrorResponse): ErrorAutenticacion {
  const mensajeApi: unknown = error.error?.message;
  let message = 'No pudimos continuar con Google. Inténtalo de nuevo.';
  if (error.status === 401) {
    message = MENSAJE_GOOGLE_INVALIDO;
  } else if (error.status === 409) {
    message = typeof mensajeApi === 'string' ? mensajeApi : 'Ya existe una cuenta con ese correo';
  } else if (error.status === 503) {
    message = 'El acceso con Google no está disponible en este momento.';
  } else if (error.status === 429) {
    message = MENSAJE_DEMASIADOS_INTENTOS;
  } else if (error.status === 400) {
    message = 'Datos invalidos, revisa el formulario';
  } else if (error.status === 0) {
    message = 'No se pudo conectar con el servidor';
  }
  return new ErrorAutenticacion(error.status, message);
}

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
  emailVerificado: boolean;
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
  private location = inject(Location);
  private http = inject(HttpClient);
  private suscripcionService = inject(SuscripcionService);
  private googleIdentity = inject(GoogleIdentityService);

  isLoggedIn = signal(false);
  currentUser = signal<UserData | null>(null);
  empresa = signal<Empresa | null>(null);
  sucursales = signal<Sucursal[]>([]);
  sucursalActual = signal<Sucursal | null>(null);
  empleado = signal<Empleado | null>(null);
  /** Cuenta de Google que aún no tiene negocio. Solo en memoria: se pierde al recargar. */
  registroGoogle = signal<RegistroGooglePendiente | null>(null);

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
        // Diferido: authInterceptor inyecta AuthService, que aún se está construyendo.
        queueMicrotask(() => {
          this.suscripcionService.cargar();
          this.cargarEmpresa();
        });
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
        catchError((error: HttpErrorResponse) => {
          let message = 'Error al iniciar sesion';
          if (error.status === 401) {
            message = 'Email o contrasena incorrectos';
          } else if (error.status === 429) {
            message = MENSAJE_DEMASIADOS_INTENTOS;
          } else if (error.status === 0) {
            message = 'No se pudo conectar con el servidor';
          }
          return throwError(() => new ErrorAutenticacion(error.status, message));
        }),
      );
  }

  /**
   * Envía el `credential` del botón de Google. Si la cuenta existe inicia sesión; si no, guarda el
   * registro pendiente en memoria y lleva a "Completa los datos de tu negocio".
   * Los errores llegan como `ErrorAutenticacion`.
   */
  continuarConGoogle(credential: string): Observable<void> {
    return this.http
      .post<GoogleAuthResponse>(`${environment.apiUrl}/auth/google`, { credential })
      .pipe(
        map((response) => {
          if (requiereRegistroGoogle(response)) {
            this.registroGoogle.set({ credential, perfil: response.perfil });
            this.router.navigate(['/registro-google']);
          } else {
            this.handleLoginResponse(response);
          }
        }),
        catchError((error: HttpErrorResponse) => this.fallaGoogle(error)),
      );
  }

  registrarConGoogle(data: GoogleRegistroRequest): Observable<LoginApiResponse> {
    return this.http
      .post<LoginApiResponse>(`${environment.apiUrl}/auth/google/registro`, data)
      .pipe(
        tap((response) => this.handleLoginResponse(response)),
        catchError((error: HttpErrorResponse) => this.fallaGoogle(error)),
      );
  }

  private fallaGoogle(error: HttpErrorResponse): Observable<never> {
    // 503: la API tiene deshabilitado el acceso con Google; no tiene sentido seguir ofreciéndolo.
    if (error.status === 503) {
      this.googleIdentity.deshabilitar();
    }
    return throwError(() => errorGoogle(error));
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
      emailVerificado: apiUser.emailVerificado,
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
    this.registroGoogle.set(null);

    this.router.navigate(['/admin/home']);
    this.cargarSucursales();
    this.cargarEmpresa();
    this.suscripcionService.limpiar();
    this.suscripcionService.cargar();
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

  /**
   * El login solo trae id, nombre y slug de la empresa; el resto (logo, nombre comercial)
   * se completa desde la ficha pública de la empresa.
   */
  cargarEmpresa(): void {
    const slug = this.empresa()?.slug;
    if (!slug) return;
    this.http.get<Empresa>(`${environment.apiUrl}/reservar/empresa-slug/${slug}`).subscribe({
      next: (data) => {
        if (data) {
          this.actualizarEmpresa({
            logo: data.logo ?? null,
            nombreComercial: data.nombreComercial,
          });
        }
      },
      error: () => {},
    });
  }

  /** Actualiza la empresa en memoria y en localStorage para que el cambio se vea en toda la app. */
  actualizarEmpresa(cambios: Partial<Empresa>): void {
    const actual = this.empresa();
    if (!actual) return;
    const empresa: Empresa = { ...actual, ...cambios };
    this.empresa.set(empresa);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.EMPRESA_KEY, JSON.stringify(empresa));
    }
  }

  /** Actualiza el estado de verificación en memoria y en localStorage. Sin sesión no hace nada. */
  actualizarEmailVerificado(emailVerificado: boolean): void {
    const actual = this.currentUser();
    if (!actual) return;
    const usuario: UserData = { ...actual, emailVerificado };
    this.currentUser.set(usuario);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
    }
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
    return this.http.post<LoginApiResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
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

  /** @param navegar `false` si quien llama hace su propia navegación después de cerrar la sesión. */
  logout(navegar = true): void {
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
    this.registroGoogle.set(null);
    this.suscripcionService.limpiar();
    if (navegar && !PAGINAS_DE_CUENTA.includes(this.location.path().split(/[?#]/)[0])) {
      this.router.navigate(['/login']);
    }
  }
}
