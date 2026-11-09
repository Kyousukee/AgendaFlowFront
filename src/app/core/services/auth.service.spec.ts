import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginApiResponse } from '../interfaces/auth-response.interface';
import { AuthService } from './auth.service';
import { GoogleIdentityService } from './google-identity.service';
import { ErrorAutenticacion } from '../errors/error-autenticacion';

@Component({ template: '' })
class VacioComponent {}

const USER_KEY = 'agendaflow_user';

function almacenEnMemoria(): Storage {
  const datos = new Map<string, string>();
  return {
    get length() {
      return datos.size;
    },
    clear: () => datos.clear(),
    getItem: (k: string) => datos.get(k) ?? null,
    key: (i: number) => [...datos.keys()][i] ?? null,
    removeItem: (k: string) => void datos.delete(k),
    setItem: (k: string, v: string) => void datos.set(k, v),
  };
}

function respuestaLogin(emailVerificado: boolean): LoginApiResponse {
  return {
    accessToken: 'jwt',
    user: {
      id: 1,
      nombre: 'Ana',
      apellido: 'Rojas',
      email: 'ana@correo.cl',
      rolId: 1,
      emailVerificado,
      empleado: {
        id: 2,
        nombre: 'Ana',
        apellido: 'Rojas',
        email: 'ana@correo.cl',
        telefono: null,
        foto: null,
        sucursal: {
          id: 3,
          nombre: 'Centro',
          direccion: 'Calle 1',
          empresa: { id: 4, nombre: 'Barbería', slug: 'barberia' },
        },
      },
    },
  };
}

describe('AuthService: verificación de email y logout', () => {
  let auth: AuthService;
  let controller: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    vi.stubGlobal('localStorage', almacenEnMemoria());
    vi.stubGlobal('sessionStorage', almacenEnMemoria());
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLocationMocks(),
        provideRouter([{ path: '**', component: VacioComponent }]),
      ],
    });
    auth = TestBed.inject(AuthService);
    controller = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => vi.unstubAllGlobals());

  function iniciarSesion(emailVerificado: boolean): void {
    auth.login('ana@correo.cl', 'unaclave123').subscribe();
    controller.expectOne(`${environment.apiUrl}/auth/login`).flush(respuestaLogin(emailVerificado));
  }

  it('copia emailVerificado de la respuesta del login a la sesión', () => {
    iniciarSesion(false);
    expect(auth.currentUser()?.emailVerificado).toBe(false);
    expect(JSON.parse(localStorage.getItem(USER_KEY)!).emailVerificado).toBe(false);
  });

  it('actualizarEmailVerificado cambia la señal y localStorage', () => {
    iniciarSesion(false);
    auth.actualizarEmailVerificado(true);
    expect(auth.currentUser()?.emailVerificado).toBe(true);
    expect(JSON.parse(localStorage.getItem(USER_KEY)!).emailVerificado).toBe(true);
  });

  it('actualizarEmailVerificado no hace nada sin sesión', () => {
    auth.actualizarEmailVerificado(true);
    expect(auth.currentUser()).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('logout navega a /login por defecto', async () => {
    const navigate = vi.spyOn(router, 'navigate');
    auth.logout();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('logout(false) cierra la sesión sin navegar', () => {
    iniciarSesion(true);
    const navigate = vi.spyOn(router, 'navigate');
    auth.logout(false);
    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });

  it.each(['/olvide-contrasena', '/verificar-email', '/restablecer-contrasena?token=x'])(
    'un 401 de una sesión vencida no saca al usuario de %s',
    (ruta) => {
      TestBed.inject(Location).go(ruta);
      const navigate = vi.spyOn(router, 'navigate');
      auth.logout();
      expect(auth.isLoggedIn()).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    },
  );
});

describe('AuthService: continuar con Google', () => {
  let auth: AuthService;
  let controller: HttpTestingController;
  let router: Router;
  const URL_GOOGLE = `${environment.apiUrl}/auth/google`;
  const URL_REGISTRO_GOOGLE = `${environment.apiUrl}/auth/google/registro`;

  beforeEach(() => {
    vi.stubGlobal('localStorage', almacenEnMemoria());
    vi.stubGlobal('sessionStorage', almacenEnMemoria());
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLocationMocks(),
        provideRouter([{ path: '**', component: VacioComponent }]),
      ],
    });
    auth = TestBed.inject(AuthService);
    controller = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('con accessToken y user guarda la sesión igual que el login normal', () => {
    const navigate = vi.spyOn(router, 'navigate');
    auth.continuarConGoogle('cred').subscribe();
    const req = controller.expectOne(URL_GOOGLE);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ credential: 'cred' });
    req.flush(respuestaLogin(true));

    expect(auth.isLoggedIn()).toBe(true);
    expect(localStorage.getItem('agendaflow_token')).toBe('jwt');
    expect(auth.registroGoogle()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/admin/home']);
  });

  it('con requiereRegistro guarda credential y perfil solo en memoria y lleva al formulario', () => {
    const navigate = vi.spyOn(router, 'navigate');
    const perfil = { email: 'ana@gmail.com', nombre: 'Ana', apellido: 'Rojas' };
    auth.continuarConGoogle('cred').subscribe();
    controller.expectOne(URL_GOOGLE).flush({ requiereRegistro: true, perfil });

    expect(auth.registroGoogle()).toEqual({ credential: 'cred', perfil });
    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.length).toBe(0);
    expect(navigate).toHaveBeenCalledWith(['/registro-google']);
  });

  it.each([
    [401, 'No pudimos validar tu cuenta de Google, inténtalo de nuevo'],
    [429, 'Demasiados intentos'],
  ])('un %i se traduce a un mensaje claro', (status, mensaje) => {
    let error: ErrorAutenticacion | undefined;
    auth.continuarConGoogle('cred').subscribe({ error: (e) => (error = e) });
    controller.expectOne(URL_GOOGLE).flush({}, { status, statusText: 'x' });
    expect(error?.status).toBe(status);
    expect(error?.message).toContain(mensaje);
  });

  it('un 409 muestra el mensaje del back', () => {
    let error: ErrorAutenticacion | undefined;
    auth.continuarConGoogle('cred').subscribe({ error: (e) => (error = e) });
    controller
      .expectOne(URL_GOOGLE)
      .flush({ message: 'Ese correo ya tiene cuenta' }, { status: 409, statusText: 'Conflict' });
    expect(error?.message).toBe('Ese correo ya tiene cuenta');
  });

  it('un 503 deshabilita el botón de Google en toda la app', () => {
    const google = TestBed.inject(GoogleIdentityService);
    const deshabilitar = vi.spyOn(google, 'deshabilitar');
    auth.continuarConGoogle('cred').subscribe({ error: () => {} });
    controller.expectOne(URL_GOOGLE).flush({}, { status: 503, statusText: 'x' });
    expect(deshabilitar).toHaveBeenCalled();
  });

  it('registrarConGoogle envía el credential y los datos, y guarda la sesión', () => {
    auth.registroGoogle.set({ credential: 'cred', perfil: { email: 'ana@gmail.com' } });
    auth
      .registrarConGoogle({
        credential: 'cred',
        nombre: 'Ana',
        apellido: '',
        empresaNombre: 'Barbería',
      })
      .subscribe();
    const req = controller.expectOne(URL_REGISTRO_GOOGLE);
    expect(req.request.body).toEqual({
      credential: 'cred',
      nombre: 'Ana',
      apellido: '',
      empresaNombre: 'Barbería',
    });
    req.flush(respuestaLogin(true));
    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.registroGoogle()).toBeNull();
  });

  it('un 401 en el login normal llega con su estado (para sugerir Google)', () => {
    let error: ErrorAutenticacion | undefined;
    auth.login('ana@gmail.com', 'x').subscribe({ error: (e) => (error = e) });
    controller
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({}, { status: 401, statusText: 'x' });
    expect(error?.status).toBe(401);
  });
});
