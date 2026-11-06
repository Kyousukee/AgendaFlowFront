import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { RestablecerContrasenaComponent } from './restablecer-contrasena.component';

@Component({ template: '' })
class VacioComponent {}

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

describe('RestablecerContrasenaComponent', () => {
  const urlApi = `${environment.apiUrl}/auth/restablecer-contrasena`;
  const CLAVE = 'unaclave123';
  let controller: HttpTestingController;
  let harness: RouterTestingHarness;
  let componente: RestablecerContrasenaComponent;
  const logout = vi.fn();

  beforeEach(async () => {
    logout.mockClear();
    vi.stubGlobal('localStorage', almacenEnMemoria());
    vi.stubGlobal('sessionStorage', almacenEnMemoria());
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLocationMocks(),
        provideRouter([
          {
            path: '',
            children: [
              { path: 'restablecer-contrasena', component: RestablecerContrasenaComponent },
              { path: 'login', component: VacioComponent },
            ],
          },
        ]),
        { provide: AuthService, useValue: { logout } },
      ],
    });
    controller = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    controller.verify();
    vi.unstubAllGlobals();
  });

  async function abrir(url: string): Promise<void> {
    componente = (await harness.navigateByUrl(url)) as RestablecerContrasenaComponent;
    await harness.fixture.whenStable();
  }

  const texto = (): string => (harness.routeNativeElement as HTMLElement).textContent ?? '';

  async function enviar(password = CLAVE, confirmPassword = password): Promise<void> {
    componente.form.setValue({ password, confirmPassword });
    componente.onSubmit();
    await harness.fixture.whenStable();
  }

  async function responder(cuerpo: object | null, status: number, statusText: string) {
    controller.expectOne(urlApi).flush(cuerpo, { status, statusText });
    await harness.fixture.whenStable();
  }

  it('quita el token de la URL y no lo guarda en el navegador ni llama a la API al entrar', async () => {
    await abrir('/restablecer-contrasena?token=secreto');
    expect(TestBed.inject(Location).path()).toBe('/restablecer-contrasena');
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    controller.expectNone(urlApi);
    expect(texto()).toContain('Elige tu contraseña');
  });

  it('sin token muestra el enlace inválido con un enlace a /olvide-contrasena', async () => {
    await abrir('/restablecer-contrasena');
    expect(texto()).toContain('no es válido o venció');
    const enlace = (harness.routeNativeElement as HTMLElement).querySelector('.auth__card a');
    expect(enlace?.getAttribute('href')).toBe('/olvide-contrasena');
    expect((harness.routeNativeElement as HTMLElement).querySelector('form')).toBeNull();
  });

  it('usa autocomplete new-password en los dos campos', async () => {
    await abrir('/restablecer-contrasena?token=secreto');
    const campos = (harness.routeNativeElement as HTMLElement).querySelectorAll('input');
    expect(campos.length).toBe(2);
    campos.forEach((c) => expect(c.getAttribute('autocomplete')).toBe('new-password'));
  });

  it.each([
    ['menos de 8 caracteres', 'corta12', 'corta12'],
    ['más de 72 caracteres', 'a'.repeat(73), 'a'.repeat(73)],
    ['confirmación distinta', CLAVE, 'otraclave123'],
  ])('no llama a la API con %s', async (_caso, password, confirmacion) => {
    await abrir('/restablecer-contrasena?token=secreto');
    await enviar(password, confirmacion);
    controller.expectNone(urlApi);
  });

  it('avisa si las contraseñas no coinciden', async () => {
    await abrir('/restablecer-contrasena?token=secreto');
    await enviar(CLAVE, 'otraclave123');
    expect(texto()).toContain('no coinciden');
  });

  it.each([8, 72])('acepta una contraseña de %i caracteres', async (largo) => {
    await abrir('/restablecer-contrasena?token=secreto');
    await enviar('a'.repeat(largo));
    await responder({ message: 'ok' }, 200, 'OK');
  });

  it('en 200 envía el token, cierra la sesión sin navegar y va a /login?restablecida=1', async () => {
    await abrir('/restablecer-contrasena?token=secreto');
    await enviar();

    const req = controller.expectOne(urlApi);
    expect(req.request.body).toEqual({ token: 'secreto', password: CLAVE });
    req.flush({ message: 'Tu contraseña fue restablecida. Inicia sesión.' });
    await harness.fixture.whenStable();

    expect(logout).toHaveBeenCalledExactlyOnceWith(false);
    expect(TestBed.inject(Router).url).toBe('/login?restablecida=1');
  });

  it('en 400 por token muestra el mensaje de la API y el enlace a /olvide-contrasena', async () => {
    await abrir('/restablecer-contrasena?token=vencido');
    await enviar();
    await responder({ message: 'El enlace no es válido o venció' }, 400, 'Bad Request');

    expect(texto()).toContain('El enlace no es válido o venció');
    const enlace = (harness.routeNativeElement as HTMLElement).querySelector('.auth__card a');
    expect(enlace?.getAttribute('href')).toBe('/olvide-contrasena');
    expect(logout).not.toHaveBeenCalled();
  });

  it('en 400 por validación de la contraseña conserva el formulario', async () => {
    await abrir('/restablecer-contrasena?token=secreto');
    await enviar();
    await responder(
      { message: ['password must be shorter than or equal to 72 characters'] },
      400,
      'Bad Request',
    );
    expect(texto()).toContain('entre 8 y 72 caracteres');
    expect((harness.routeNativeElement as HTMLElement).querySelector('form')).not.toBeNull();
  });

  it('en 400 por validación del token muestra el enlace inválido', async () => {
    await abrir('/restablecer-contrasena?token=secreto');
    await enviar();
    await responder(
      { message: ['token must be shorter than or equal to 128 characters'] },
      400,
      'Bad Request',
    );
    expect((harness.routeNativeElement as HTMLElement).querySelector('form')).toBeNull();
    expect(texto()).toContain('no es válido o venció');
  });

  it('con 429 o sin conexión conserva el token para reintentar', async () => {
    await abrir('/restablecer-contrasena?token=secreto');
    await enviar();
    await responder(null, 429, 'Too Many Requests');
    expect(texto()).toContain('demasiados intentos');

    await enviar();
    controller.expectOne(urlApi).error(new ProgressEvent('error'), { status: 0 });
    await harness.fixture.whenStable();
    expect(texto()).toContain('conectar con el servidor');

    await enviar();
    const req = controller.expectOne(urlApi);
    expect(req.request.body.token).toBe('secreto');
    req.flush({ message: 'ok' });
  });

  it('no envía dos veces mientras la petición está en curso', async () => {
    await abrir('/restablecer-contrasena?token=secreto');
    await enviar();
    componente.onSubmit();
    controller.expectOne(urlApi).flush({ message: 'ok' });
  });
});
