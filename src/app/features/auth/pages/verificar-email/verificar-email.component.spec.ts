import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { VerificarEmailComponent } from './verificar-email.component';

describe('VerificarEmailComponent', () => {
  const urlApi = `${environment.apiUrl}/auth/verificar-email`;
  let controller: HttpTestingController;
  let harness: RouterTestingHarness;
  const isLoggedIn = signal(false);
  const actualizarEmailVerificado = vi.fn();

  beforeEach(async () => {
    isLoggedIn.set(false);
    actualizarEmailVerificado.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLocationMocks(),
        // Misma forma que la app: la ruta real cuelga de un padre con path vacío.
        provideRouter([
          { path: '', children: [{ path: 'verificar-email', component: VerificarEmailComponent }] },
        ]),
        { provide: AuthService, useValue: { isLoggedIn, actualizarEmailVerificado } },
      ],
    });
    controller = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => controller.verify());

  async function abrir(url: string): Promise<void> {
    await harness.navigateByUrl(url);
    await TestBed.inject(Router).navigated;
    await harness.fixture.whenStable();
  }

  async function responder(cuerpo: object | null, status = 200, statusText = 'OK'): Promise<void> {
    controller.expectOne(urlApi).flush(cuerpo, { status, statusText });
    await harness.fixture.whenStable();
  }

  const texto = (): string => (harness.routeNativeElement as HTMLElement).textContent ?? '';
  const enlace = (): string | null =>
    (harness.routeNativeElement as HTMLElement)
      .querySelector('.auth__card a')
      ?.getAttribute('href') ?? null;

  it('quita el token de la URL y llama a la API una sola vez', async () => {
    await abrir('/verificar-email?token=secreto');

    expect(TestBed.inject(Location).path()).toBe('/verificar-email');
    expect(TestBed.inject(Router).url).toBe('/verificar-email');
    expect(texto()).toContain('Verificando');

    const req = controller.expectOne(urlApi);
    expect(req.request.body).toEqual({ token: 'secreto' });
    req.flush({ emailVerificado: true });
    await harness.fixture.whenStable();
    controller.expectNone(urlApi);
  });

  it('sin token muestra el enlace inválido y no llama a la API', async () => {
    await abrir('/verificar-email');
    controller.expectNone(urlApi);
    expect(texto()).toContain('no es válido o venció');
  });

  it('con el token vacío muestra el enlace inválido y limpia la URL', async () => {
    await abrir('/verificar-email?token=');
    controller.expectNone(urlApi);
    expect(texto()).toContain('no es válido o venció');
    expect(TestBed.inject(Location).path()).toBe('/verificar-email');
  });

  it('en éxito con sesión actualiza el usuario y ofrece el panel', async () => {
    isLoggedIn.set(true);
    await abrir('/verificar-email?token=secreto');
    await responder({ emailVerificado: true });

    expect(actualizarEmailVerificado).toHaveBeenCalledWith(true);
    expect(texto()).toContain('correo verificado');
    expect(enlace()).toBe('/admin/home');
  });

  it('en éxito sin sesión ofrece el login', async () => {
    await abrir('/verificar-email?token=secreto');
    await responder({ emailVerificado: true });
    expect(texto()).toContain('correo verificado');
    expect(enlace()).toBe('/login');
  });

  it('con 400 aclara que pudo usarse y que se pide otro desde el panel', async () => {
    await abrir('/verificar-email?token=vencido');
    await responder({ message: 'El enlace no es válido o venció' }, 400, 'Bad Request');
    expect(texto()).toContain('ya se haya usado');
    expect(texto()).toContain('desde el panel');
    expect(actualizarEmailVerificado).not.toHaveBeenCalled();
  });

  it('con 429 no dice que el enlace sea inválido', async () => {
    await abrir('/verificar-email?token=secreto');
    await responder(null, 429, 'Too Many Requests');
    expect(texto()).toContain('demasiados intentos');
    expect(texto()).not.toContain('no es válido');
  });
});
