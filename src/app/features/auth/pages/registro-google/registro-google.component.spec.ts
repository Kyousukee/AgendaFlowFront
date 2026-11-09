import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleIdentityService } from '../../../../core/services/google-identity.service';
import { ErrorAutenticacion } from '../../../../core/errors/error-autenticacion';
import {
  GoogleRegistroRequest,
  RegistroGooglePendiente,
} from '../../../../core/interfaces/google-auth.interface';
import { RegistroGoogleComponent } from './registro-google.component';

@Component({ template: '' })
class VacioComponent {}

const PENDIENTE: RegistroGooglePendiente = {
  credential: 'cred-google',
  perfil: { email: 'ana@gmail.com', nombre: 'Ana', apellido: 'Rojas' },
};

describe('RegistroGoogleComponent', () => {
  let registrar: ReturnType<typeof vi.fn<(d: GoogleRegistroRequest) => Observable<unknown>>>;

  async function abrir(pendiente: RegistroGooglePendiente | null) {
    registrar = vi.fn<(d: GoogleRegistroRequest) => Observable<unknown>>(() => of({}));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'registro-google', component: RegistroGoogleComponent },
          { path: 'register', component: VacioComponent },
        ]),
        {
          provide: AuthService,
          useValue: { registroGoogle: signal(pendiente), registrarConGoogle: registrar },
        },
        // Sin client ID el botón de Google no se dibuja; simulamos que está disponible.
        {
          provide: GoogleIdentityService,
          useValue: {
            disponible: signal(true),
            deshabilitar: () => {},
            renderizarBoton: () => Promise.resolve(),
            soltar: () => {},
          },
        },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/registro-google');
    await harness.fixture.whenStable();
    return harness;
  }

  function escribir(el: HTMLElement, selector: string, valor: string): void {
    const input = el.querySelector<HTMLInputElement>(selector)!;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  }

  async function completarYEnviar(harness: RouterTestingHarness): Promise<HTMLElement> {
    const el = harness.routeNativeElement as HTMLElement;
    el.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
    el.querySelector<HTMLButtonElement>('.btn--primary')!.click();
    await harness.fixture.whenStable();
    escribir(el, '#empresaNombre', 'Barbería Ana');
    el.querySelector<HTMLButtonElement>('.btn--primary')!.click();
    await harness.fixture.whenStable();
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await harness.fixture.whenStable();
    return el;
  }

  it('sin registro pendiente (p. ej. tras recargar) vuelve a /register', async () => {
    await abrir(null);
    expect(TestBed.inject(Router).url).toBe('/register');
  });

  it('prellena nombre y apellido editables, el email de solo lectura y no pide contraseña', async () => {
    const harness = await abrir(PENDIENTE);
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('h2')?.textContent).toContain('Completa los datos de tu negocio');
    expect(el.querySelector<HTMLInputElement>('#nombre')!.value).toBe('Ana');
    expect(el.querySelector<HTMLInputElement>('#nombre')!.readOnly).toBe(false);
    expect(el.querySelector<HTMLInputElement>('#apellido')!.value).toBe('Rojas');
    const email = el.querySelector<HTMLInputElement>('#email')!;
    expect(email.value).toBe('ana@gmail.com');
    expect(email.readOnly).toBe(true);
    expect(el.querySelector('input[type="password"]')).toBeNull();
  });

  it('envía credential, nombre, apellido y los datos del negocio', async () => {
    const harness = await abrir(PENDIENTE);
    escribir(harness.routeNativeElement as HTMLElement, '#nombre', 'Anita');
    await completarYEnviar(harness);

    expect(registrar).toHaveBeenCalledTimes(1);
    const payload = registrar.mock.calls[0][0];
    expect(payload).toMatchObject({
      credential: 'cred-google',
      nombre: 'Anita',
      apellido: 'Rojas',
      empresaNombre: 'Barbería Ana',
      pais: 'Chile',
    });
    expect(payload).not.toHaveProperty('email');
    expect(payload).not.toHaveProperty('password');
  });

  it('con un 401 pide validar otra vez con Google y bloquea el envío', async () => {
    const harness = await abrir(PENDIENTE);
    registrar.mockReturnValue(
      throwError(
        () =>
          new ErrorAutenticacion(401, 'No pudimos validar tu cuenta de Google, inténtalo de nuevo'),
      ),
    );
    const el = await completarYEnviar(harness);

    expect(el.querySelector('.form-error-banner')?.textContent).toContain(
      'No pudimos validar tu cuenta de Google',
    );
    expect(el.querySelector('app-acceso-google')).not.toBeNull();
    expect(el.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
  });

  it('con un 409 muestra el mensaje del back y ofrece revisar los datos', async () => {
    const harness = await abrir(PENDIENTE);
    registrar.mockReturnValue(
      throwError(() => new ErrorAutenticacion(409, 'Ese correo ya tiene una cuenta')),
    );
    const el = await completarYEnviar(harness);

    expect(el.querySelector('.form-error-banner')?.textContent).toContain(
      'Ese correo ya tiene una cuenta',
    );
    expect(el.querySelector('.form-error-banner__action')?.textContent).toContain(
      'Revisar mis datos',
    );
  });
});
